import { combineReducers } from 'redux';
import data from './data';
import accelerometer from './accelerometer';
import mqtt from './mqtt';

export default combineReducers({
    data,
    mqtt,
    accelerometer,
});
