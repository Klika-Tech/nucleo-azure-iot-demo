import React from 'react';
import { connect } from 'react-redux';
import SimpleDimensionsChart from '../../common/SimpleDimensionsChart';

const mapStateToProps = state => ({
    data: state.gyroscope.data,
});

const GyroscopeWidget = ({ data }) => (
    <SimpleDimensionsChart
        type="gyroscope"
        units="°"
        data={data}
    />
);

export default connect(mapStateToProps)(GyroscopeWidget);
