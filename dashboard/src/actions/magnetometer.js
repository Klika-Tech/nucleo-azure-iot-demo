import {
    MAGNETOMETER_UPDATE,
    MAGNETOMETER_FOCUS_MOVE,
    MAGNETOMETER_FOCUS_OUT,
} from '../actionTypes';
import { fetchAndUpdate, pushAndUpdate, brushAndUpdate, focusMove, focusOut } from './common/dimensions';

export const magnetometerFetch = fetchAndUpdate(MAGNETOMETER_UPDATE, 'magnetometer');

export const magnetometerPush = pushAndUpdate(MAGNETOMETER_UPDATE, 'magnetometer');

export const magnetometerBrushEnd = brushAndUpdate(MAGNETOMETER_UPDATE, 'magnetometer');

export const magnetometerFocusMove = focusMove(MAGNETOMETER_FOCUS_MOVE, 'magnetometer');

export const magnetometerFocusOut = focusOut(MAGNETOMETER_FOCUS_OUT);
