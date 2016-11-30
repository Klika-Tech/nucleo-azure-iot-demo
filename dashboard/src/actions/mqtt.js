import * as SigV4Utils from '../services/awsSignService';

import {
    MQTT_CONNECT,
    MQTT_CONNECTED,
    MQTT_DISCONNECTED,
} from '../actionTypes';

export function connectToAWS(awsRegion, iotEndpoint, accessKeyId, secretAccessKey, sessionToken) {
    const url = SigV4Utils.getSignedUrl(
        'wss',
        iotEndpoint,
        '/mqtt',
        'iotdevicegateway',
        awsRegion,
        accessKeyId,
        secretAccessKey,
        sessionToken,
    );
    return connect(url, 2147483647);
}

export function connect(url, reconnectPeriod) {
    return {
        type: MQTT_CONNECT,
        payload: {
            url,
            reconnectPeriod,
        },
    };
}

export function connected() {
    return {
        type: MQTT_CONNECTED,
    };
}

export function disconnected() {
    return {
        type: MQTT_DISCONNECTED,
    };
}