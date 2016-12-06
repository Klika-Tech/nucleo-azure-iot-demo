import React, { Component } from 'react';
import { connect } from 'react-redux';
import { HYPER_PASCALS } from '../../scaleUnits';
import WeatherChart from '../common/WeatherChart';
import { changeChartType, toggleVisibility } from '../../actions/pressure';

const mapStateToProps = state => ({
    chartType: state.pressure.chartType,
    sensorData: state.pressure.sensorData,
    citiesData: state.pressure.citiesData,
    displayedCitiesData: state.pressure.displayedCitiesData,
});

const mapDispatchToProps = dispatch => ({
    handleChangeType(type) {
        dispatch(changeChartType(type));
    },
    handleToggleVisibility(value) {
        dispatch(toggleVisibility(value));
    },
});

const Barometer = ({
    sensorData, chartType, displayedCitiesData, citiesData, handleChangeType, handleToggleVisibility,
}) => (
    <WeatherChart
        type="pressure"
        units={HYPER_PASCALS}
        chartType={chartType}
        sensorData={sensorData}
        citiesData={citiesData}
        displayedCitiesData={displayedCitiesData}
        onChangeType={handleChangeType}
        onToggleVisibility={handleToggleVisibility}
    />
);

export default connect(mapStateToProps, mapDispatchToProps)(Barometer);
