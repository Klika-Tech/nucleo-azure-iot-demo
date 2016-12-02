import {
    ACCELEROMETER_UPDATE,
    ACCELEROMETER_FOCUS_MOVE,
    ACCELEROMETER_FOCUS_OUT,
} from '../actionTypes';
import { fetchAndUpdate, pushAndUpdate, brushAndUpdate, focusMove, focusOut } from './common/dimensions';

export const accelerometerFetch = fetchAndUpdate(ACCELEROMETER_UPDATE, 'accelerometer');

export const accelerometerPush = pushAndUpdate(ACCELEROMETER_UPDATE, 'accelerometer');

export const accelerometerBrushEnd = brushAndUpdate(ACCELEROMETER_UPDATE, 'accelerometer');

export const accelerometerFocusMove = focusMove(ACCELEROMETER_FOCUS_MOVE, 'accelerometer');

export const accelerometerFocusOut = focusOut(ACCELEROMETER_FOCUS_OUT);
