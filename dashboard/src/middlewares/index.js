import { compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import mqtt from './mqtt';
import config from '../config';

export default compose(
    applyMiddleware(thunk, mqtt),
    /**
     * Conditionally add the Redux DevTools extension enhancer
     * if it is installed.
     */
    (window.devToolsExtension && config.debug) ? window.devToolsExtension() : f => f,
);
