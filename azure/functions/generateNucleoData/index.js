const { DocumentClient } = require('documentdb');
const { Mqtt } = require('azure-iot-device-mqtt');
const { Client, Message } = require('azure-iot-device');
const iothub = require('azure-iothub');
const Random = require('random-js');
const Q = require('q');
const _ = require('lodash');
const { connectionString, deviceId, generateMarkers, dbHost, dbMasterKey, dbName, dbCollectionName } = require('./config.js');

const RECORD_ID = "unique_record_id";
const registry = iothub.Registry.fromConnectionString(connectionString);
const device = {
    deviceId: deviceId
};
const random = new Random(Random.engines.nativeMath);
const dbClient = new DocumentClient(dbHost, {masterKey: dbMasterKey});

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

const generateSensorsData = (lastValue = {}) => {
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

    const rnd1 = random.real(0, 1);
    const rnd2 = random.real(0, 1);
    if(generateMarkers && (rnd1 < .25 && rnd2 < .25)) {
        newSensorValues.marker = true;
    }

    return newSensorValues;
};

const getCollectionLink = () => {
    return `dbs/${dbName}/colls/${dbCollectionName}`;
};

const getDocumentLink = () => {
    return `${getCollectionLink()}/docs/${RECORD_ID}`;
};

const getDeviceConnectionString = (connectionString, deviceId, deviceInfo) => {
    const HostName = connectionString.match(/([^=;]*)=([^=;]*)/m)[2];
    const SharedAccessKey =  deviceInfo.authentication.symmetricKey.primaryKey;
    return `HostName=${HostName};DeviceId=${deviceId};SharedAccessKey=${SharedAccessKey}`;
};

const getDocument = (context, link) => {
    const defer = Q.defer();
    dbClient.readDocument(link, function (err, doc) {
        if (err) {
            context.log('Loaded error: ' + JSON.stringify(err));
            defer.reject(err);
        } else {
            context.log('Loaded success: ' + JSON.stringify(doc));
            defer.resolve(doc)
        }
    });
    return defer.promise;
};

const getGeneratedValue = (context, link) => {
    const documentPromise = getDocument(context, link);
    return documentPromise.then((doc) => {
        return generateSensorsData(doc);
    }, (err) => {
        context.log('Last value not founded generate new: ' + JSON.stringify(err));
        return Q.resolve(generateSensorsData())
    });
};

const sendData = (context, client) => (data) =>  {
    const defer = Q.defer();
    const message = new Message(JSON.stringify(data));
    client.sendEvent(message, function (err, res) {
        if (err) {
            context.log('Send new value error: ' + JSON.stringify(err));
            defer.reject(err);
        }
        context.log('Send status: ' + res.constructor.name);
        defer.resolve(data);
    });
    return defer.promise;
};

const upsertDocument = (context, link) => (document) => {
    const defer = Q.defer();
    document.id = RECORD_ID;
    dbClient.upsertDocument(link, document, function (err, doc) {
        if (err) {
            context.log('Replace error: ' + JSON.stringify(err));
            defer.reject(err);
        } else {
            context.log('Replace success: ' + JSON.stringify(doc));
            defer.resolve(doc)
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
        const client = Client.fromConnectionString(deviceConnectionString, Mqtt);
        client.open(function(err) {
            if (err) {
                context.log('Could not connect: ' + err.message);
                context.done();
            } else {
                context.log('Client connected!');
                getGeneratedValue(context, getDocumentLink())
                    .then(sendData(context, client))
                    .then(upsertDocument(context, getCollectionLink()))
                    .then((data) => {
                        context.done();
                    }, (err) => {
                        context.done();
                    });
            }
        });
    }, () => {
        context.done();
    });
};

