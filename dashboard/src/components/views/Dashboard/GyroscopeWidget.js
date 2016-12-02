import React from 'react';
import { connect } from 'react-redux';
import SimpleDimensionsChart from '../../common/SimpleDimensionsChart';

const mapStateToProps = state => ({
    data: state.gyroscope.data,
    yDomain: state.gyroscope.yDomain,
    xDomain: state.gyroscope.focusDomain,
});

const GyroscopeWidget = ({ data, yDomain, xDomain }) => (
    <SimpleDimensionsChart
        type="gyroscope"
        data={data}
        yDomain={yDomain}
        yUnits="°"
        xDomain={xDomain}
    />
);

export default connect(mapStateToProps)(GyroscopeWidget);
