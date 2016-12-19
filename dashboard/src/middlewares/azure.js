import { AZURE_CONNECT, WS_DISCONNECTED } from '../actionTypes';
import * as FetchService from '../services/fetch';
import config from '../config';
import { fetchData } from '../actions/data';
import { connect } from '../actions/socket';

const azureMiddleware = store => next => (action) => {
    switch (action.type) {
    case AZURE_CONNECT:
        FetchService.fetchMetrics(config).then((data) => {
            store.dispatch(fetchData(data));
            identifyAndConnect(store.dispatch, config);
        });
        break;
    case WS_DISCONNECTED:
        setTimeout(() => {
            if (config.debug) console.log('WS: Reconnect...');
            identifyAndConnect(store.dispatch, config);
        }, 1000);
        break;
    default:
        return next(action);
    }
};

export default azureMiddleware;

function identifyAndConnect(dispatch, { eventNotifierUri }) {
    dispatch(connect({ url: eventNotifierUri }));
}
