import _ from 'lodash';
import { FETCH_DATA, PUSH_DATA } from '../actionTypes';

export default function (state = {}, { type, payload }) {
    switch (type) {
    case FETCH_DATA: {
        return fetchData(payload);
    }
    case PUSH_DATA:
        return pushData(state, payload);
    default:
        return state;
    }
}

function fetchData(payload) {
    const st = prepareData(payload);
    st.accelerometerData = prepareAccelerometerData(st.sensorData);
    return st;
}

function pushData(state, payload) {
    const sensorData = getActualSensorData(state);
    sensorData.push(prepareDataItem(payload));
    return {
        weatherData: state.weatherData,
        accelerometerData: prepareAccelerometerData(sensorData),
        sensorData,
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

function prepareAccelerometerData(data) {
    return _(data)
        .map(item => ({
            accelerometer: {
                x: item.accelerometer[0],
                y: item.accelerometer[1],
                z: item.accelerometer[2],
            },
            date: new Date(item.timestamp * 1000),
            marker: item.marker,
        }),
        )
        .value();
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

function getActualSensorData(state, last = 86400) {
    return _(state.sensorData)
        .filter(item => item.timestamp >= Math.round(Date.now() / 1000) - last)
        .value();
}
