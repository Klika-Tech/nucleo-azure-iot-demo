import { WS_CONNECT } from '../actionTypes';
import { connected, disconnected } from '../actions/socket';
import { pushData } from '../actions/data';
import config from '../config';

const socketMiddleware = (function () {
    let client = null;
    let interval = null;

    return (store) => {
        let messages = [];
        if (interval) clearInterval(interval);
        interval = setInterval(() => {
            if (messages.length) {
                if (config.debug) console.log('WS: dispatch batch update');
                store.dispatch(pushData(messages));
                messages = [];
            }
        }, 1000);
        return next => (action) => {
            switch (action.type) {
            case WS_CONNECT:
                if (client != null) {
                    client.end();
                }

                client = new WebSocket(action.payload.url);
                client.onopen = (e) => {
                    if (config.debug) console.log('WS: client connected');
                    store.dispatch(connected());
                    setTimeout(() => {
                        client.close();
                    }, 270000); // 4.5 minutes
                };

                client.onclose = (e) => {
                    if (config.debug) console.log('WS: client disconnected');
                    store.dispatch(disconnected());
                };

                client.onmessage = (e) => {
                    if (e.type === 'message') {
                        const msg = JSON.parse(e.data);
                        if (config.debug) { console.info('WS: Message received.', msg); }
                        messages.push(msg);
                    }
                };

                break;
            default:
                return next(action);
            }
        };
    };
}());

export default socketMiddleware;
