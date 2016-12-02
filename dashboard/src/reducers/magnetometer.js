import {
    MAGNETOMETER_FOCUS_MOVE,
    MAGNETOMETER_FOCUS_OUT,
    MAGNETOMETER_UPDATE,
} from '../actionTypes';
import { update, focusMove, focusOut } from './common/dimensions';

export default function (state = {}, { type, payload }) {
    switch (type) {
    case MAGNETOMETER_FOCUS_MOVE: {
        return focusMove(state, payload);
    }
    case MAGNETOMETER_FOCUS_OUT: {
        return focusOut(state);
    }
    case MAGNETOMETER_UPDATE: {
        return update(state, payload);
    }
    default:
        return state;
    }
}
