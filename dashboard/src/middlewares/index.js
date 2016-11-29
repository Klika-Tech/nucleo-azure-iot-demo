import { compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import config from '../config';

export default compose(
    applyMiddleware(thunk),
    /**
     * Conditionally add the Redux DevTools extension enhancer
     * if it is installed.
     */
    (window.devToolsExtension && config.debug) ? window.devToolsExtension() : f => f,
);
