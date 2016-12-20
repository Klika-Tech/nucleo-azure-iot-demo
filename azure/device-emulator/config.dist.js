module.exports = {
    connectionString: 'HostName=<iothub_host_name>;SharedAccessKeyName=<key_name>;SharedAccessKey=<access_key>',
    deviceId: 'board-simulator',
    sendMessageIntervalMs: 3 * 1000,
    generateMarkers: false,
    dbHost: '<documentdb endpoint>',
    dbMasterKey: '<documentdb endpoint>'
};