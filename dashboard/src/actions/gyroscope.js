import { GYROSCOPE_UPDATE } from '../actionTypes';
import { fetchAndUpdate, pushAndUpdate, brushAndUpdate } from './common/dimensions';

export const gyroscopeFetch = fetchAndUpdate(GYROSCOPE_UPDATE, 'gyroscope');

export const gyroscopePush = pushAndUpdate(GYROSCOPE_UPDATE, 'gyroscope');

export const gyroscopeBrushEnd = brushAndUpdate(GYROSCOPE_UPDATE, 'gyroscope');
