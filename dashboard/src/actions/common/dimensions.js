import * as d3 from 'd3';
import _ from 'lodash';

export function fetchAndUpdate(type, key) {
    const pdi = prepareDataItem(key);
    const cd = calculateDomains(key);
    return (fullData) => {
        const data = fullData.sensorData.map(pdi);
        const domains = cd(data);
        return {
            type,
            payload: { ...domains, data },
        };
    };
}

export function pushAndUpdate(type, key) {
    const pdi = prepareDataItem(key);
    const cd = calculateDomains(key);
    return chunks => (dispatch, getState) => {
        const state = getState()[key];
        let data = state.data;
        data = data.concat(chunks.map(pdi));
        data = getActualData(data);
        const domains = cd(data, state.brushDomain);
        dispatch({
            type,
            payload: {
                ...domains,
                data,
                brushDomain: state.brushDomain,
                brushSelection: state.brushSelection,
            },
        });
    };
}

export function brushAndUpdate(type, key) {
    const cd = calculateDomains(key);
    return (xScale, selection) => (dispatch, getState) => {
        const state = getState()[key];
        const brushDomain = (selection) ? selection.map(xScale.invert) : null;
        const domains = cd(state.data, brushDomain);
        dispatch({
            type,
            payload: {
                ...domains,
                data: state.data,
                brushDomain,
                brushSelection: selection,
            },
        });
    };
}

export function focusMove(type) {
    return (data, xScale, xPos) => {
        const datePos = xScale.invert(xPos);
        const cursorIndex = d3.bisector(d => d.date).right(data, datePos);
        return {
            type,
            payload: { cursorIndex, cursorX: xPos },
        };
    };
}

export function focusOut(type) {
    return () => ({
        type,
    });
}

function calculateDomains(key) {
    return (data, brushDomain = null) => {
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
            d => Math.min(d[key].x, d[key].y, d[key].z)));
        const maxY = d3.max(data.map(
            d => Math.max(d[key].x, d[key].y, d[key].z)));
        const yDomain = [
            Math.floor((minY - 0.3) * 30) / 30,
            Math.ceil((maxY + 0.3) * 30) / 30,
        ];
        return {
            contextDomain,
            yDomain,
            focusDomain: fd,
        };
    };
}


function prepareDataItem(key) {
    return item => ({
        [key]: {
            x: item[key][0],
            y: item[key][1],
            z: item[key][2],
        },
        date: new Date(item.timestamp * 1000),
        marker: item.marker,
    });
}

function getActualData(data) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return _(data)
        .filter(item => item.date.getTime() >= yesterday.getTime())
        .value();
}
