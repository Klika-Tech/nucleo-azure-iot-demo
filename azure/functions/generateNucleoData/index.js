const { clientFromConnectionString } = require('azure-iot-device-http');
const { Message } = require('azure-iot-device');
const iothub = require('azure-iothub');
const Random = require('random-js');
const Q = require('q');
const fs = require('fs');
const _ = require('lodash');
const { connectionString, deviceId, generateMarkers, generateMarkerEachMinutes } = require('./config.js');

const registry = iothub.Registry.fromConnectionString(connectionString);
const device = {
    deviceId: deviceId
};
const random = new Random(Random.engines.nativeMath);

const deviateSensor = (sensorConfig, currentValue) => {

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
};

const generateSensorsData = (context, document) => {
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
        return (document.value[key]) ? deviateSensor(config, document.value[key]) : deviateSensor(config);
    });

    const now = Date.now();

    if(generateMarkers) {
        const checkMarkerAt = now - generateMarkerEachMinutes * 60 * 1000;
        if(!document.meta.lastMarkerAt || document.meta.lastMarkerAt < checkMarkerAt) {
            context.log('Set marker at: '+ now);
            newSensorValues.marker = true;
            document.meta.lastMarkerAt = now;
        }
    }

    newSensorValues.device_id = deviceId;
    newSensorValues.timestamp = now;

    return {
        value: newSensorValues,
        meta: document.meta
    };
};

const getDeviceConnectionString = (connectionString, deviceId, deviceInfo) => {
    const HostName = connectionString.match(/([^=;]*)=([^=;]*)/m)[2];
    const SharedAccessKey =  deviceInfo.authentication.symmetricKey.primaryKey;
    return `HostName=${HostName};DeviceId=${deviceId};SharedAccessKey=${SharedAccessKey}`;
};

const getStorageFilePath = (context) => {
    return (context.modeDev)
        ? './functionStorage.txt'
        : 'D:/local/Temp/functionStorage.txt';
};

const getDocument = (context) => {
    const defer = Q.defer();
    fs.readFile(getStorageFilePath(context), 'utf8', (err, data) => {
        if (err || data === null) {
            context.log('Loaded error: ' + JSON.stringify(err || { message: 'File are empty!' }));
            defer.reject(err);
        } else {
            context.log('Loaded success: ' + data);
            defer.resolve(JSON.parse(data));
        }
    });
    return defer.promise;
};

const getGeneratedValue = (context, link) => {
    const documentPromise = getDocument(context, link);
    return documentPromise.then((document) => {
        return generateSensorsData(context, document);
    }, (err) => {
        const newDocument = generateSensorsData(context, { value: {}, meta: {}});
        context.log('Last value not founded generate new: ' + JSON.stringify(newDocument));
        return Q.resolve(newDocument)
    });
};

const sendData = (context, client) => (document) =>  {
    const defer = Q.defer();
    const message = new Message(JSON.stringify(document.value));
    client.sendEvent(message, (err, res) => {
        if (err) {
            context.log('Send new value error: ' + JSON.stringify(err));
            defer.reject(err);
        } else {
            context.log('Send status: ' + res.constructor.name);
            defer.resolve(document);
        }
    });
    return defer.promise;
};

const upsertDocument = (context) => (document) => {
    const defer = Q.defer();
    fs.writeFile(getStorageFilePath(context), JSON.stringify(document), 'utf8', (err, data) => {
        if (err) {
            context.log('Replace error: ' + JSON.stringify(err));
            defer.reject(err);
        } else {
            context.log('Replace success: ' + JSON.stringify(document));
            defer.resolve(data)
        }
    });
    return defer.promise;
};

const getDeviceInfo = (context) => {
    const defer = Q.defer();
    registry.get(device.deviceId, (err, deviceInfo) => {
        if (err) {
            context.log('GET device error: ' + err.toString());
            defer.reject(err)
        }
        if (deviceInfo) defer.resolve(deviceInfo)
    });
    return defer.promise;
};

const createDevice = (context) => {
    const defer = Q.defer();
    registry.create(device, function(err, deviceInfo) {
        if (err) {
            context.log('CREATE device error: ' + err.toString());
            defer.reject(err);
            context.done(); // Hotfix
        }
        if (deviceInfo) defer.resolve(deviceInfo);
    });
    return defer.promise;
};

const getOrCreateDevice = (context) => {
    return getDeviceInfo(context).then(
        deviceInfo => deviceInfo,
        (err) => createDevice(context)
    )
};

module.exports = function (context) {
    getOrCreateDevice(context).then((deviceInfo) => {
        const deviceConnectionString = getDeviceConnectionString(connectionString, deviceId, deviceInfo);
        const client = clientFromConnectionString(deviceConnectionString);
        client.open(function(err) {
            if (err) {
                context.log('Could not connect: ' + err.message);
                context.done();
            } else {
                context.log('Client connected!');
                getGeneratedValue(context)
                    .then(sendData(context, client))
                    .then(upsertDocument(context))
                    .then(() => {
                        context.done();
                    }, (err) => {
                        context.log('Bubbled error:' + JSON.stringify(err));
                        context.done();
                    });
            }
        });
    }, (err) => {
        context.log('IoT Hub error:' + JSON.stringify(err));
        context.done();
    });
};

