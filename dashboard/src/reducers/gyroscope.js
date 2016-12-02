import {
    GYROSCOPE_FOCUS_MOVE,
    GYROSCOPE_FOCUS_OUT,
    GYROSCOPE_UPDATE,
} from '../actionTypes';
import { update, focusMove, focusOut } from './common/dimensions';

export default function (state = {}, { type, payload }) {
    switch (type) {
    case GYROSCOPE_FOCUS_MOVE: {
        return focusMove(state, payload);
    }
    case GYROSCOPE_FOCUS_OUT: {
        return focusOut(state);
    }
    case GYROSCOPE_UPDATE: {
        return update(state, payload);
    }
    default:
        return state;
    }
}
