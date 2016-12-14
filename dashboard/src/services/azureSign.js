import moment from 'moment';

export function generateMqttSettings(endpoint, deviceId, accessKey) {
    return {
        url: `mqtts://${endpoint}:8883`,
        options: {
            clientId: deviceId,
            username: `${endpoint}/${deviceId}`,
            password: generateSasToken(endpoint, deviceId, accessKey),
        },
    };
}

// Create a SAS token
export function generateSasToken(endpoint, deviceId, accessKey, time = 1) {
    const sr = encodeURIComponent(`${endpoint}/devices/${deviceId}`);
    const sig = accessKey;
    const se = moment().add(time, 'hours').unix();
    return `SharedAccessSignature sr=${sr}&sig=${sig}&se=${se}`;
}
