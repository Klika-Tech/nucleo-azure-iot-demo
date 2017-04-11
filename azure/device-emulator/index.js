const { Mqtt } = require('azure-iot-device-mqtt');
const { Client, Message } = require('azure-iot-device');
const iothub = require('azure-iothub');
const Random = require('random-js');
const _ = require('lodash');
const { connectionString, deviceId, sendMessageIntervalMs, generateMarkers, generateMarkerEach} = require('./config.js');

console.log("==========================");
console.log("=====DEVICE EMULATOR======");
console.log("==========================");
console.log("IoT Hub connectionString:", connectionString);
console.log("deviceId:", deviceId);
console.log("sendMessageIntervalMs:", sendMessageIntervalMs);
console.log("generateMarkers:", generateMarkers);

const registry = iothub.Registry.fromConnectionString(connectionString);
const device = {
    deviceId: deviceId
};
const random = new Random(Random.engines.nativeMath);

let client;
let messageSendInterval;
let lastGeneratedData;
let lastMarkerAt;

const getDeviceInfoPromise = new Promise((resolve, reject) => {
    registry.get(device.deviceId, (err, deviceInfo) => {
        if (err) {
            console.log('GET device: ' + err.toString());
            reject(err)
        }
        if (deviceInfo) resolve(deviceInfo)
    });
});

const getOrCreateDevicePromise = getDeviceInfoPromise.catch((e) => {
    return new Promise((resolve, reject) => {
        registry.create(device, function(err, deviceInfo, res) {
            if (err) {
                console.log('CREATE device: ' + err.toString());
                reject(err);
            }
            if (deviceInfo) resolve(deviceInfo);
        });
    })
});

getOrCreateDevicePromise.then((deviceInfo) => {
   const deviceConnectionString = getDeviceConnectionString(connectionString, deviceId, deviceInfo);
   console.log('Device connectionString:', deviceConnectionString);
    client = Client.fromConnectionString(deviceConnectionString, Mqtt);
    client.open(connectCallback);
});

function getDeviceConnectionString(connectionString, deviceId, deviceInfo) {
    const HostName = connectionString.match(/([^=;]*)=([^=;]*)/m)[2];
    const SharedAccessKey =  deviceInfo.authentication.symmetricKey.primaryKey;
    return `HostName=${HostName};DeviceId=${deviceId};SharedAccessKey=${SharedAccessKey}`;
}

function connectCallback(err) {
    if (err) {
        console.error('Could not connect: ' + err.message);
    } else {
        console.log('Client connected');
        client.on('message', function (msg) {
            console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
            client.complete(msg, printResultFor('completed'));
        });

        messageSendInterval = setInterval(() => {
            const data = generateSensorsData(lastGeneratedData);
            const message = new Message(JSON.stringify(data));
            message.properties.add('dataType', 'telemetry');
            client.sendEvent(message, printResultFor('send'));
            lastGeneratedData = data;
        }, sendMessageIntervalMs);

        client.on('error', function (err) {
            console.error('Error on send message:', JSON.stringify(err));
        });

        client.on('disconnect', function () {
            clearInterval(messageSendInterval);
            client.removeAllListeners();
            client.open(connectCallback);
        });
    }
}

function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}

function generateSensorsData(lastValue = {}) {
    const sensorsConfig = {
        temperature: {
            initial: 20,
            maxDelta: .03,
            min: -20,
            max: 40
        },
        humidity: {
            initial: 60,
            maxDelta: .03,
            min: 10,
            max: 99
        },
        pressure: {
            initial: 1000,
            maxDelta: .1,
            min: 800,
            max: 1060
        },
        accelerometer: {
            initial: [0, 0, 1],
            maxDelta: .5,
            min: -3,
            max: 3
        },
        gyroscope: {
            initial: [0, 0, 0],
            maxDelta: 5,
            min: -100,
            max: 100
        },
        magnetometer: {
            initial: [-.5, -.1, .5],
            maxDelta: .005,
            min: -.6,
            max: .6
        }
    };

    const newSensorValues = _.mapValues(sensorsConfig, (config, key) => {
        return (lastValue) ? deviateSensor(config, lastValue[key]) : deviateSensor(config);
    });

    if(generateMarkers) {
        const now = Date.now();
        const checkMarkerAt = now - generateMarkerEach;
        if(!lastMarkerAt || lastMarkerAt < checkMarkerAt) {
            console.log('Set marker at: '+ now);
            newSensorValues.marker = true;
            lastMarkerAt = now;
        }
    }

    return newSensorValues;
}

function deviateSensor(sensorConfig, currentValue) {

    if (currentValue === undefined) currentValue = sensorConfig.initial;

    if (_.isArray(currentValue))
        return _.map(currentValue, v => {
            return deviateSensor(sensorConfig, v)
        });

    let newValue = currentValue;

    const rnd = random.real(0, 1);
    let shift = sensorConfig.maxDelta;

    if (currentValue > sensorConfig.max) shift *= 2;
    else if (currentValue < sensorConfig.min) shift *= -2;

    if (rnd < .3) newValue = newValue + random.real(0, 1) * sensorConfig.maxDelta * 2 - shift;

    return newValue
}