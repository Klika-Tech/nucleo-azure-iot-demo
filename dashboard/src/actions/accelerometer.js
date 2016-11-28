import { ACCELEROMETER_FETCH, ACCELEROMETER_PUSH } from '../actionTypes';

export function accelerometerFetch(data) {
    return {
        type: ACCELEROMETER_FETCH,
        payload: data.sensorData.map(prepareAccelerometerDataItem),
    };
}

export function accelerometerPush(chunk) {
    return {
        type: ACCELEROMETER_PUSH,
        payload: prepareAccelerometerDataItem(chunk),
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
