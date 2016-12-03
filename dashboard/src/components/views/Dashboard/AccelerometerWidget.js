import React from 'react';
import { connect } from 'react-redux';
import SimpleDimensionsChart from '../../common/SimpleDimensionsChart';

const mapStateToProps = state => ({
    data: state.accelerometer.data,
});

const AccelerometerWidget = ({ data }) => (
    <SimpleDimensionsChart
        type="accelerometer"
        units="g"
        data={data}
    />
);

export default connect(mapStateToProps)(AccelerometerWidget);
