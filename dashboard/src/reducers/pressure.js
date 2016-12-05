import { PRESSURE_UPDATE, PRESSURE_CHANGE_CHART_TYRE, PRESSURE_TOGGLE_VISIBILITY } from '../actionTypes';
import { AREA_CHART } from '../chartTypes';

/**
 * State shape:
 * chartType: 'line'|'area'
 * showFor = [];
 * data = [];
 * weatherData = [];
 * */

export default function (state = { chartType: AREA_CHART, showFor: [] }, { type, payload }) {
    switch (type) {
    case PRESSURE_UPDATE: {
        return update(state, payload);
    }
    case PRESSURE_CHANGE_CHART_TYRE: {
        return changeType(state, payload);
    }
    case PRESSURE_TOGGLE_VISIBILITY: {
        return toggleVisibility(state, payload);
    }
    default:
        return state;
    }
}

function update(state, { data, weatherData }) {
    return {
        ...state,
        data,
        weatherData,
    };
}

function changeType(state, { chartType }) {
    return {
        ...state,
        chartType,
    };
}

function toggleVisibility(state, { showFor }) {
    return {
        ...state,
        showFor,
    };
}
