import { MAGNETOMETER_UPDATE } from '../actionTypes';
import { fetchAndUpdate, pushAndUpdate, brushAndUpdate } from './common/dimensions';

export const magnetometerFetch = fetchAndUpdate(MAGNETOMETER_UPDATE, 'magnetometer');

export const magnetometerPush = pushAndUpdate(MAGNETOMETER_UPDATE, 'magnetometer');

export const magnetometerBrushEnd = brushAndUpdate(MAGNETOMETER_UPDATE, 'magnetometer');
