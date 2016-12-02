import {
    GYROSCOPE_UPDATE,
    GYROSCOPE_FOCUS_MOVE,
    GYROSCOPE_FOCUS_OUT,
} from '../actionTypes';
import { fetchAndUpdate, pushAndUpdate, brushAndUpdate, focusMove, focusOut } from './common/dimensions';

export const gyroscopeFetch = fetchAndUpdate(GYROSCOPE_UPDATE, 'gyroscope');

export const gyroscopePush = pushAndUpdate(GYROSCOPE_UPDATE, 'gyroscope');

export const gyroscopeBrushEnd = brushAndUpdate(GYROSCOPE_UPDATE, 'gyroscope');

export const gyroscopeFocusMove = focusMove(GYROSCOPE_FOCUS_MOVE, 'gyroscope');

export const gyroscopeFocusOut = focusOut(GYROSCOPE_FOCUS_OUT);
