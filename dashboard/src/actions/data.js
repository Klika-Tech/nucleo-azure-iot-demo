import _ from 'lodash';
import { DATA_FETCHED } from '../actionTypes';
import { accelerometerFetch, accelerometerPush } from './accelerometer';
import { gyroscopeFetch, gyroscopePush } from './gyroscope';
import { magnetometerFetch, magnetometerPush } from './magnetometer';

export function fetchData(data) {
    return (dispatch) => {
        const pd = prepareData(data);
        dispatch(accelerometerFetch(pd));
        dispatch(gyroscopeFetch(pd));
        dispatch(magnetometerFetch(pd));
        dispatch({ type: DATA_FETCHED });
    };
}

export function pushData(chunks) {
    return (dispatch) => {
        const pds = chunks.map(prepareDataItem);
        dispatch(accelerometerPush(pds));
        dispatch(gyroscopePush(pds));
        dispatch(magnetometerPush(pds));
    };
}

function prepareData(data) {
    _.forEach(data.weatherData, (d) => {
        d.tempData = _.map(d.tempData, prepareDataItem);
        d.humidityData = _.map(d.humidityData, prepareDataItem);
        d.pressureData = _.map(d.pressureData, prepareDataItem);
    });
    return data;
}

function prepareDataItem(dataItem) {
    const result = {
        timestamp: dataItem.timestamp === undefined
            ? Math.round(Date.now() / 1000)
            : +dataItem.timestamp,
        marker: dataItem.marker,
    };

    if (dataItem.temperature !== undefined) result.temperature = parseFloat(dataItem.temperature);
    if (dataItem.humidity !== undefined) result.humidity = parseFloat(dataItem.humidity);
    if (dataItem.pressure !== undefined) result.pressure = parseFloat(dataItem.pressure);
    if (dataItem.magnetometer !== undefined) result.magnetometer = dataItem.magnetometer;
    if (dataItem.accelerometer !== undefined) result.accelerometer = dataItem.accelerometer;
    if (dataItem.gyroscope !== undefined) result.gyroscope = dataItem.gyroscope;

    return result;
}
