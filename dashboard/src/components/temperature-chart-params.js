import React from 'react';
import _ from 'lodash';
import { Form, FormGroup, ControlLabel, Radio, Checkbox } from '@sketchpixy/rubix';

export default class TemperatureChartParams extends React.Component {
    constructor(props) {
        super(props);
        this.setChartType = this.setChartType.bind(this);
        this.setUnits = this.setUnits.bind(this);
        this.setShowWeatherFor = this.setShowWeatherFor.bind(this);
    }
    setChartType(event) {
        this.props.setChartParam('chartType', event.target.value);
    }
    setUnits(event) {
        this.props.setChartParam('units', event.target.value);
    }
    setShowWeatherFor(event) {
        const value = +event.target.value;

        let showWeatherFor;

        if (_.includes(this.props.chartParams.showWeatherFor, value)) {
            showWeatherFor = _.without(this.props.chartParams.showWeatherFor, value);
        } else {
            showWeatherFor = _.union(this.props.chartParams.showWeatherFor, [value]);
        }

        this.props.setChartParam('showWeatherFor', showWeatherFor);
    }
    render() {
        const that = this;

        const chartParams = this.props.chartParams;

        return (
            <div className="temperature-chart-params">
                <Form>
                    <FormGroup>
                        <ControlLabel>Chart Type</ControlLabel>
                        <Radio
                            checked={chartParams.chartType === 'area'} value="area" onChange={this.setChartType}
                            inline
                        >Area</Radio>
                        <Radio
                            checked={chartParams.chartType === 'line'} value="line" onChange={this.setChartType}
                            inline
                        >Line</Radio>
                    </FormGroup>

                    <FormGroup>
                        <ControlLabel>Units</ControlLabel>
                        <Radio checked={chartParams.units === 'c'} value="c" onChange={this.setUnits} inline>°C</Radio>
                        <Radio checked={chartParams.units === 'f'} value="f" onChange={this.setUnits} inline>°F</Radio>
                    </FormGroup>

                    <FormGroup>
                        <ControlLabel>Weather Data</ControlLabel>
                        {_(this.props.weatherData)
                            .sortBy(d => d.cityName)
                            .map(d => <Checkbox
                                                key={d.cityId}
                                                checked={_.includes(chartParams.showWeatherFor, d.cityId)}
                                                value={d.cityId}
                                                onChange={that.setShowWeatherFor}
                            >{d.cityName}</Checkbox>).value()}
                    </FormGroup>
                </Form>
            </div>
        );
    }
}

TemperatureChartParams.propTypes = {
    setChartParam: React.PropTypes.func,
    chartParams: React.PropTypes.shape({
        test: React.PropTypes.number,
    }),
    weatherData: React.PropTypes.arrayOf(
        React.PropTypes.shape({
            cityId: React.PropTypes.string,
        }),
    ),
};
