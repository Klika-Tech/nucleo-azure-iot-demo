import { ACCELEROMETER_UPDATE } from '../actionTypes';
import { fetchAndUpdate, pushAndUpdate, brushAndUpdate } from './common/dimensions';

export const accelerometerFetch = fetchAndUpdate(ACCELEROMETER_UPDATE, 'accelerometer');

export const accelerometerPush = pushAndUpdate(ACCELEROMETER_UPDATE, 'accelerometer');

export const accelerometerBrushEnd = brushAndUpdate(ACCELEROMETER_UPDATE, 'accelerometer');
