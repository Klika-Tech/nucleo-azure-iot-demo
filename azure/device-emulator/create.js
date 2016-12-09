const iothub = require('azure-iothub');
const { connectionString, deviceId } = require('./config.js');

const registry = iothub.Registry.fromConnectionString(connectionString);

// Create a new device 
const device = {
    deviceId: deviceId
};

registry.create(device, function(err, deviceInfo, res) {
    if (err) console.log(' error: ' + err.toString());
    if (res) console.log(' status: ' + res.statusCode + ' ' + res.statusMessage);
    if (deviceInfo) console.log(' device info: ' + JSON.stringify(deviceInfo));
});