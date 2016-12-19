import {
    WS_CONNECT,
    WS_CONNECTED,
    WS_DISCONNECTED,
} from '../actionTypes';

export function connect(options) {
    return {
        type: WS_CONNECT,
        payload: options,
    };
}

export function connected() {
    return {
        type: WS_CONNECTED,
    };
}

export function disconnected() {
    return {
        type: WS_DISCONNECTED,
    };
}
