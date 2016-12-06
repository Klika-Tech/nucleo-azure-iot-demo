import React, { Component } from 'react';
import { connect } from 'react-redux';
import { PERCENTS } from '../../scaleUnits';
import WeatherChart from '../common/WeatherChart';
import { humidityChangeChartType, humidityToggleVisibility } from '../../actions/humidity';

const mapStateToProps = state => ({
    chartType: state.humidity.chartType,
    sensorData: state.humidity.sensorData,
    citiesData: state.humidity.citiesData,
    displayedCitiesData: state.humidity.displayedCitiesData,
});

const mapDispatchToProps = dispatch => ({
    handleChangeType(type) {
        dispatch(humidityChangeChartType(type));
    },
    handleToggleVisibility(value) {
        dispatch(humidityToggleVisibility(value));
    },
});

const Humidity = ({
    sensorData, chartType, displayedCitiesData, citiesData, handleChangeType, handleToggleVisibility,
}) => (
    <WeatherChart
        type="humidity"
        units={PERCENTS}
        chartType={chartType}
        sensorData={sensorData}
        citiesData={citiesData}
        displayedCitiesData={displayedCitiesData}
        onChangeType={handleChangeType}
        onToggleVisibility={handleToggleVisibility}
    />
);

export default connect(mapStateToProps, mapDispatchToProps)(Humidity);
