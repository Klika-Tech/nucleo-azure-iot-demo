import { combineReducers } from 'redux';
import accelerometer from './accelerometer';
import mqtt from './mqtt';

export default combineReducers({
    accelerometer,
    mqtt,
});
