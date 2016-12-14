import { compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import mqtt from './mqtt';
import aws from './azure';
import config from '../config';

export default compose(
    applyMiddleware(thunk, mqtt, aws),
    (window.devToolsExtension && config.debug) ? window.devToolsExtension() : f => f,
);
