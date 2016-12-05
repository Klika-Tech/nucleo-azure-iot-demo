import { combineReducers } from 'redux';
import { enableBatching } from 'redux-batched-actions';
import data from './data';
import accelerometer from './accelerometer';
import gyroscope from './gyroscope';
import magnetometer from './magnetometer';
import pressure from './pressure';
import mqtt from './mqtt';

export default enableBatching(
    combineReducers({
        data,
        mqtt,
        accelerometer,
        gyroscope,
        magnetometer,
        pressure,
    }),
);
