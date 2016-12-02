import { combineReducers } from 'redux';
import data from './data';
import accelerometer from './accelerometer';
import gyroscope from './gyroscope';
import magnetometer from './magnetometer';
import mqtt from './mqtt';

export default combineReducers({
    data,
    mqtt,
    accelerometer,
    gyroscope,
    magnetometer,
});
