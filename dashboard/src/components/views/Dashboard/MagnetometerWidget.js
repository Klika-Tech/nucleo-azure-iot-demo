import React from 'react';
import { connect } from 'react-redux';
import SimpleDimensionsChart from '../../common/SimpleDimensionsChart';

const mapStateToProps = state => ({
    data: state.magnetometer.data,
    yDomain: state.magnetometer.yDomain,
    xDomain: state.magnetometer.focusDomain,
});

const MagnetometerWidget = ({ data, yDomain, xDomain }) => (
    <SimpleDimensionsChart
        type="magnetometer"
        data={data}
        yDomain={yDomain}
        yUnits="µT"
        xDomain={xDomain}
    />
);

export default connect(mapStateToProps)(MagnetometerWidget);
