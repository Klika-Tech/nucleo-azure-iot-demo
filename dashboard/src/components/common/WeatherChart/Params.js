import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { Form, FormGroup, ControlLabel, Radio, Checkbox } from '@sketchpixy/rubix';
import './index.scss';
import { LINE_CHART, AREA_CHART } from '../../../chartTypes';

class WeatherParams extends Component {
    constructor(props) {
        super(props);
        this.setChartType = this.setChartType.bind(this);
        this.setUnits = this.setUnits.bind(this);
        this.setShowWeatherFor = this.setShowWeatherFor.bind(this);
    }
    setChartType(event) {
        const { onChangeType } = this.props;
        onChangeType.call({}, event.target.value);
    }
    setUnits(event) {
        const { setChartParam } = this.props;
        setChartParam('units', event.target.value);
    }
    setShowWeatherFor(event) {
        const { onToggleVisibility } = this.props;
        const value = parseInt(event.target.value, 0);
        onToggleVisibility.call({}, value);
    }
    render() {
        const { setShowWeatherFor } = this;
        const { chartType, units, weatherData, showFor, unitsSwitcher } = this.props;
        return (
            <div className="weather-chart-params">
                <Form>
                    <FormGroup>
                        <ControlLabel>Chart Type</ControlLabel>
                        <Radio
                            checked={chartType === AREA_CHART}
                            value={AREA_CHART} onChange={this.setChartType}
                            inline
                        >
                            Area
                        </Radio>
                        <Radio
                            checked={chartType === LINE_CHART}
                            value={LINE_CHART}
                            onChange={this.setChartType}
                            inline
                        >
                            Line
                        </Radio>
                    </FormGroup>
                    {unitsSwitcher && (
                        <FormGroup>
                            <ControlLabel>Units</ControlLabel>
                            <Radio checked={units === 'c'} value="c" onChange={this.setUnits} inline>°C</Radio>
                            <Radio checked={units === 'f'} value="f" onChange={this.setUnits} inline>°F</Radio>
                        </FormGroup>
                    )}
                    <FormGroup>
                        <ControlLabel>Weather Data</ControlLabel>
                        {_(weatherData).sortBy(d => d.cityName).map(d => (
                            <Checkbox
                                key={d.cityId}
                                checked={_.includes(showFor, d.cityId)}
                                value={d.cityId}
                                onChange={setShowWeatherFor}
                            >{d.cityName}</Checkbox>)).value()}
                    </FormGroup>
                </Form>
            </div>
        );
    }
}

WeatherParams.propTypes = {
    chartType: PropTypes.string,
    showFor: PropTypes.array,
    unitsSwitcher: PropTypes.bool,
    units: PropTypes.shape({
        key: PropTypes.string,
        label: PropTypes.string,
    }),
    weatherData: PropTypes.arrayOf(PropTypes.shape({
        cityId: PropTypes.number,
        cityName: PropTypes.string,
    })),
    onChangeType: PropTypes.func,
    onToggleVisibility: PropTypes.func,
    onChangeUnits: PropTypes.func,
};

export default WeatherParams;
