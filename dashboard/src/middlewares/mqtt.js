import mqtt from 'mqtt';
import { MQTT_CONNECT } from '../actionTypes';
import { connect, connected, disconnected } from '../actions/mqtt';
import { pushData } from '../actions/data';
import config from '../config';

const mqttMiddleware = (function () {
    let client = null;
    let url = null;
    let reconnectPeriod = null;

    return store => next => (action) => {
        switch (action.type) {
        case MQTT_CONNECT:
            if (client != null) {
                client.end();
            }
            url = action.payload.url;
            reconnectPeriod = action.payload.reconnectPeriod;
            client = mqtt.connect(url, { reconnectPeriod });

            client.on('connect', () => {
                if (config.debug) console.log('MQTT client connected');
                store.dispatch(connected());
                client.subscribe(config.mqttTopic);
                setTimeout(() => {
                    client.end();
                }, 270000); // 4.5 minutes
            });
            client.on('close', () => {
                if (config.debug) console.log('MQTT client disconnected');
                client.end();
                store.dispatch(disconnected());
                setTimeout(() => {
                    if (config.debug) console.log('Reconnecting');
                    store.dispatch(connect(url, reconnectPeriod));
                }, 1000);
            });
            client.on('message', (topic, msg) => {
                const message = msg.toString();
                if (config.debug) console.info('Message recieved.\nTopic: %s\nPayload: %s', topic, message);
                if (topic === config.mqttTopic) {
                    store.dispatch(pushData(JSON.parse(message)));
                }
            });
            break;
        default:
            return next(action);
        }
    };
}());

export default mqttMiddleware;
