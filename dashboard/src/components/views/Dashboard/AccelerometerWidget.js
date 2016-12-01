import React from 'react';
import { connect } from 'react-redux';
import SimpleDimensionsChart from '../../common/SimpleDimensionsChart';

const mapStateToProps = state => ({
    data: state.accelerometer.data,
    yDomain: state.accelerometer.yDomain,
    xDomain: state.accelerometer.focusDomain,
});

const AccelerometerWidget = ({ data, yDomain, xDomain }) => (
    <SimpleDimensionsChart
        type="accelerometer"
        data={data}
        yDomain={yDomain}
        yUnits="g"
        xDomain={xDomain}
    />
);

export default connect(mapStateToProps)(AccelerometerWidget);
