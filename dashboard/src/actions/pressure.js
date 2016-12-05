import { PRESSURE_UPDATE } from '../actionTypes';
import { getActualData } from './common/utils';
import { HYPER_PASCALS } from './../scaleUnits';

export const pressureFetch = (fullData) => {
    const pdi = prepareSensorDataItem(HYPER_PASCALS);
    const data = fullData.sensorData.map(pdi);
    return {
        type: PRESSURE_UPDATE,
        payload: { data },
    };
};

export const pressurePush = (chunks, state) => {
    const pdi = prepareSensorDataItem(HYPER_PASCALS);
    let data = state.data;
    data = data.concat(chunks.map(pdi));
    data = getActualData(data);
    return {
        type: PRESSURE_UPDATE,
        payload: {
            data,
        },
    };
};

function prepareSensorDataItem(scaleUnit) {
    return (item) => {
        return {
            pressure: {
                [scaleUnit.key]: item.pressure,
            },
            date: new Date(item.timestamp * 1000),
            marker: item.marker,
        };
    };
}
