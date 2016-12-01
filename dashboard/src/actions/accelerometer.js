import * as d3 from 'd3';
import _ from 'lodash';
import {
    ACCELEROMETER_UPDATE,
    ACCELEROMETER_FOCUS_MOVE,
    ACCELEROMETER_FOCUS_OUT,
} from '../actionTypes';

export const accelerometerFetch = data => accelerometerFetchAndUpdate(data);

function accelerometerFetchAndUpdate(fullData) {
    const data = fullData.sensorData.map(prepareAccelerometerDataItem);
    const domains = calculateDomains(data);
    return {
        type: ACCELEROMETER_UPDATE,
        payload: { ...domains, data },
    };
}

export const accelerometerPush = chunks => accelerometerPushAndUpdate(chunks);

function accelerometerPushAndUpdate(chunks) {
    return (dispatch, getState) => {
        const state = getState().accelerometer;
        let data = state.data;
        data = data.concat(chunks.map(prepareAccelerometerDataItem));
        data = getActualData(data);
        const domains = calculateDomains(data, state.brushDomain);
        dispatch({
            type: ACCELEROMETER_UPDATE,
            payload: {
                ...domains,
                data,
                brushDomain: state.brushDomain,
                brushSelection: state.brushSelection,
            },
        });
    };
}

export const accelerometerBrushEnd = (xScale, selection) => accelerometerBrushAndUpdate(xScale, selection);

function accelerometerBrushAndUpdate(xScale, selection) {
    return (dispatch, getState) => {
        const state = getState().accelerometer;
        const brushDomain = (selection) ? selection.map(xScale.invert) : null;
        const domains = calculateDomains(state.data, brushDomain);
        dispatch({
            type: ACCELEROMETER_UPDATE,
            payload: {
                ...domains,
                data: state.data,
                brushDomain,
                brushSelection: selection,
            },
        });
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

function calculateDomains(data, brushDomain = null) {
    const contextDomain = d3.extent(data.map(d => d.date));
    const bisector = d3.bisector(d => d.date).right;
    let fd = (brushDomain) ? brushDomain : [contextDomain[1] - 300000, contextDomain[1]];
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
        contextDomain,
        yDomain,
        focusDomain: fd,
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

function getActualData(data) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return _(data)
        .filter(item => item.date.getTime() >= yesterday.getTime())
        .value();
}
