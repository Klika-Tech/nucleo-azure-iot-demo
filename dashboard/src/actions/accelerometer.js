import * as d3 from 'd3';
import {
    ACCELEROMETER_FETCH,
    ACCELEROMETER_PUSH,
    ACCELEROMETER_FOCUS_MOVE,
    ACCELEROMETER_FOCUS_OUT,
    ACCELEROMETER_UPDATE,
    ACCELEROMETER_BRUSH_END,
} from '../actionTypes';


export function accelerometerFetch(data) {
    return (dispatch, getState) => {
        dispatch(accelerometerFetchAction(data));
        const state = getState().accelerometer;
        dispatch(accelerometerUpdate(state.data, state.focusDomain, state.brushDomain));
    };
}

function accelerometerFetchAction(data) {
    return {
        type: ACCELEROMETER_FETCH,
        payload: data.sensorData.map(prepareAccelerometerDataItem),
    };
}

export function accelerometerPush(chunk) {
    return (dispatch, getState) => {
        dispatch(accelerometerPushAction(chunk));
        const state = getState().accelerometer;
        dispatch(accelerometerUpdate(state.data, state.focusDomain, state.brushDomain));
    };
}

function accelerometerPushAction(chunk) {
    return {
        type: ACCELEROMETER_PUSH,
        payload: prepareAccelerometerDataItem(chunk),
    };
}

export function accelerometerFocusMove(data, xScale, xPos) {
    const datePos = xScale.invert(xPos);
    const cursorIndex = d3.bisector(d => d.date).right(data, datePos);
    return {
        type: ACCELEROMETER_FOCUS_MOVE,
        payload: { cursorIndex, cursorX: xPos },
    };
}

export function accelerometerFocusOut() {
    return {
        type: ACCELEROMETER_FOCUS_OUT,
    };
}

export function accelerometerUpdate(data, focusDomain = null, brushDomain = null) {
    const contextDomain = d3.extent(data.map(d => d.date));
    const bisector = d3.bisector(d => d.date).right;
    let fd = focusDomain;
    fd = (!fd) ? [contextDomain[1] - 300000, contextDomain[1]] : fd;
    fd = (brushDomain) ? brushDomain : fd;
    const [minX, maxX] = fd;
    const focusData = data.slice(
        Math.max(0, bisector(data, minX) - 1),
        Math.min(data.length, bisector(data, maxX) + 1),
    );
    fd = d3.extent(focusData.map(d => d.date));
    const minY = d3.min(data.map(
        d => Math.min(d.accelerometer.x, d.accelerometer.y, d.accelerometer.z)));
    const maxY = d3.max(data.map(
        d => Math.max(d.accelerometer.x, d.accelerometer.y, d.accelerometer.z)));
    const yDomain = [
        Math.floor((minY - 0.3) * 30) / 30,
        Math.ceil((maxY + 0.3) * 30) / 30,
    ];
    return {
        type: ACCELEROMETER_UPDATE,
        payload: {
            contextDomain,
            focusDomain: fd,
            yDomain,
        },
    };
}

export function accelerometerBrushEnd(xScale, selection) {
    return (dispatch, getState) => {
        dispatch(accelerometerBrushEndAction(xScale, selection));
        const state = getState().accelerometer;
        dispatch(accelerometerUpdate(state.data, state.focusDomain, state.brushDomain));
    };
}

function accelerometerBrushEndAction(xScale, selection) {
    const brushDomain = selection.map(xScale.invert);
    return {
        type: ACCELEROMETER_BRUSH_END,
        payload: brushDomain,
    };
}

function prepareAccelerometerDataItem(item) {
    return {
        accelerometer: {
            x: item.accelerometer[0],
            y: item.accelerometer[1],
            z: item.accelerometer[2],
        },
        date: new Date(item.timestamp * 1000),
        marker: item.marker,
    };
}
