const crypto = require('crypto-browserify');

export function generateMqttSettings(endpoint, deviceId, accessKey) {
    return {
        url: `mqtts://${endpoint}`,
        options: {
            protocolId: 'MQTT',
            protocolVersion: 4,
            clean: false,
            clientId: deviceId,
            rejectUnauthorized: true,
            reconnectPeriod: 0,
            username: getDeviceUserName(endpoint, deviceId),
            password: new Buffer(generateIotToken(endpoint, deviceId, accessKey)),
        },
    };
}

export function generateIotToken(host, deviceId, key) {
    const uri = encodeUriComponentStrict(`${host}/devices/${deviceId}`);
    const sas = SharedAccessSignature.create(uri, null, key, anHourFromNow());
    return sas.toString();
}

function getDeviceUserName(endpoint, deviceId) {
    const versionString = encodeURIComponent('azure-iot-device/1.1.2');
    const endpointVersionQueryString = '?api-version=2016-11-14';
    return `${endpoint}/${deviceId}/DeviceClientType=${versionString}&${endpointVersionQueryString.substr(1)}`;
}

// ------------------------- //
// ------------------------- //

export function SharedAccessSignature() {
}

SharedAccessSignature.create = function create(resourceUri, keyName, key, expiry) {
    const sas = new SharedAccessSignature();
    sas.key = key;
    sas.sr = resourceUri;
    if (keyName) sas.skn = encodeUriComponentStrict(keyName);
    sas.se = expiry;
    sas.sig = encodeUriComponentStrict(
        hmacHash(sas.key, stringToSign(sas.sr, sas.se)),
    );
    return sas;
};

SharedAccessSignature.prototype.extend = function extend(expiry) {
    this.se = expiry;
    this.sig = encodeUriComponentStrict(
        hmacHash(this.key, stringToSign(this.sr, this.se)),
    );
    return this.toString();
};

SharedAccessSignature.prototype.toString = function () {
    let sas = 'SharedAccessSignature ';
    ['sr', 'sig', 'skn', 'se'].forEach((key) => {
        if (this[key]) {
            if (sas[sas.length - 1] !== ' ') sas += '&';
            sas += `${key}=${this[key]}`;
        }
    });
    return sas;
};

function hmacHash(password, stringToSign) {
    const hmac = crypto.createHmac('sha256', new Buffer(password, 'base64'));
    hmac.update(stringToSign);
    return hmac.digest('base64');
}

function encodeUriComponentStrict(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16)}`);
}

function stringToSign(resourceUri, expiry) {
    return `${resourceUri}\n${expiry}`;
}

function anHourFromNow() {
    const raw = (Date.now() / 1000) + 3600;
    return Math.ceil(raw);
}

