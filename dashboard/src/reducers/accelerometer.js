import {
    ACCELEROMETER_FOCUS_MOVE,
    ACCELEROMETER_FOCUS_OUT,
    ACCELEROMETER_UPDATE,
} from '../actionTypes';
import { update, focusMove, focusOut } from './common/dimensions';

export default function (state = {}, { type, payload }) {
    switch (type) {
    case ACCELEROMETER_FOCUS_MOVE: {
        return focusMove(state, payload);
    }
    case ACCELEROMETER_FOCUS_OUT: {
        return focusOut(state);
    }
    case ACCELEROMETER_UPDATE: {
        return update(state, payload);
    }
    default:
        return state;
    }
}
