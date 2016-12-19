import {
    WS_CONNECTED,
    WS_DISCONNECTED,
} from '../actionTypes';

export default function (state = {}, { type }) {
    switch (type) {
    case WS_CONNECTED: {
        return { connected: true };
    }
    case WS_DISCONNECTED: {
        return { connected: false };
    }
    default:
        return state;
    }
}
