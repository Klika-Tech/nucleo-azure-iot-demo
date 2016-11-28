import _ from 'lodash';
import { ACCELEROMETER_FETCH, ACCELEROMETER_PUSH } from '../actionTypes';

/**
 * data = [];
 * contextDomain = [];
 * focusDomain = [];
 * cursorX = 0;
 * cursorY = 0;
 * cursorVisible = false;
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
    return {
        data,
    };
}

function getCleanedData(data, last = 86400) {
    return _(data)
        .filter(item => item.date.getTime() / 1000 >= Math.round(Date.now() / 1000) - last)
        .value();
}

