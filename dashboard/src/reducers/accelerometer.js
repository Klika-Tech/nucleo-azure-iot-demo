import {
    ACCELEROMETER_FOCUS_MOVE,
    ACCELEROMETER_FOCUS_OUT,
    ACCELEROMETER_UPDATE,
} from '../actionTypes';

/**
 * data = [];
 * cursorIndex = 0;
 * cursorVisible = false;
 * cursorX = 0;
 * contextDomain = [];
 * focusDomain = [];
 * defaultFocusDomain = [];
 * yDomain = [];
 * brushSelection = [];
 * brushDomain = [];
 * */

export default function (state = {}, { type, payload }) {
    switch (type) {
    case ACCELEROMETER_FOCUS_MOVE: {
        return accelerometerFocusMove(state, payload);
    }
    case ACCELEROMETER_FOCUS_OUT: {
        return accelerometerFocusOut(state);
    }
    case ACCELEROMETER_UPDATE: {
        return accelerometerUpdate(state, payload);
    }
    default:
        return state;
    }
}

function accelerometerFocusMove(state, payload) {
    return {
        ...state,
        cursorVisible: true,
        cursorIndex: payload.cursorIndex,
        cursorX: payload.cursorX,
    };
}

function accelerometerUpdate(state, { data, contextDomain, focusDomain, yDomain, brushDomain, brushSelection }) {
    return {
        ...state,
        data,
        contextDomain,
        focusDomain,
        yDomain,
        brushDomain,
        brushSelection,
    };
}

function accelerometerFocusOut(state) {
    return {
        ...state,
        cursorVisible: false,
    };
}
