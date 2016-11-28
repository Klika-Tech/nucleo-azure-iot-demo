import _ from 'lodash';
import {
    ACCELEROMETER_FETCH,
    ACCELEROMETER_PUSH,
    ACCELEROMETER_FOCUS_MOVE,
    ACCELEROMETER_FOCUS_OUT,
    ACCELEROMETER_UPDATE,
    ACCELEROMETER_BRUSH_END,
} from '../actionTypes';

/**
 * data = [];
 * cursorIndex = 0;
 * cursorVisible = false;
 * cursorX = 0;
 * contextDomain = [];
 * focusDomain = [];
 * yDomain = [];
 * brushSelection = [];
 * */

export default function (state = {}, { type, payload }) {
    switch (type) {
    case ACCELEROMETER_FETCH: {
        return accelerometerFetch(payload);
    }
    case ACCELEROMETER_PUSH: {
        return accelerometerPush(state, payload);
    }
    case ACCELEROMETER_FOCUS_MOVE: {
        return accelerometerFocusMove(state, payload);
    }
    case ACCELEROMETER_FOCUS_OUT: {
        return accelerometerFocusOut(state);
    }
    case ACCELEROMETER_UPDATE: {
        return accelerometerUpdate(state, payload);
    }
    case ACCELEROMETER_BRUSH_END: {
        return accelerometerBrushEnd(state, payload);
    }
    default:
        return state;
    }
}

function accelerometerFetch(payload) {
    return {
        data: payload,
    };
}

function accelerometerPush(state, payload) {
    const data = getCleanedData(state.data);
    data.push(payload);
    const cursorIndex = (state.cursorIndex >= 0) ? state.cursorIndex + 1 : -1;
    return { ...state, cursorIndex, data };
}

function accelerometerFocusMove(state, payload) {
    return {
        ...state,
        cursorVisible: true,
        cursorIndex: payload.cursorIndex,
        cursorX: payload.cursorX,
    };
}

function accelerometerUpdate(state, { contextDomain, focusDomain, yDomain }) {
    return {
        ...state,
        contextDomain,
        focusDomain,
        yDomain,
    };
}

function accelerometerBrushEnd(state, payload) {
    return {
        ...state,
        brushDomain: payload,
    };
}

function accelerometerFocusOut(state) {
    return {
        ...state,
        cursorVisible: false,
    };
}

function getCleanedData(data, last = 86400) {
    return _(data)
        .filter(item => item.date.getTime() / 1000 >= Math.round(Date.now() / 1000) - last)
        .value();
}

