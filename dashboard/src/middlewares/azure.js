import { AZURE_CONNECT, MQTT_DISCONNECTED } from '../actionTypes';
import * as FetchService from '../services/fetch';
import config from '../config';
import { fetchData } from '../actions/data';
import { generateMqttSettings } from '../services/azureSign';
import { connect } from '../actions/mqtt';

const awsMiddleware = store => next => (action) => {
    switch (action.type) {
    case AZURE_CONNECT:
        // FetchService.fetchMetrics(config).then((data) => {
        //     store.dispatch(fetchData(data));
        //     identifyAndConnect(store.dispatch, config);
        // });

        identifyAndConnect(store.dispatch, config);

        break;
    case MQTT_DISCONNECTED:
        setTimeout(() => {
            if (config.debug) console.log('MQTT: Reconnect...');
            //identifyAndConnect(store.dispatch, config);
        }, 1000);
        break;
    default:
        return next(action);
    }
};

export default awsMiddleware;

function identifyAndConnect(dispatch, { iotEndpoint, iotDeviceId, iotDeviceToken }) {
    const settings = generateMqttSettings(iotEndpoint, iotDeviceId, iotDeviceToken);
    console.log('identifyAndConnect:', settings);
    dispatch(connect(settings));
}
