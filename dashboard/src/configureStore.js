import { createStore } from 'redux';
import reducers from './reducers';

export default function (initialState = {}) {
    return createStore(reducers, initialState);
}
