import { compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import socket from './socket';
import azure from './azure';
import config from '../config';

export default compose(
    applyMiddleware(thunk, socket, azure),
    (window.devToolsExtension && config.debug) ? window.devToolsExtension() : f => f,
);
