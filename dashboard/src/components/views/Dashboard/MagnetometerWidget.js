import React from 'react';
import { connect } from 'react-redux';
import SimpleDimensionsChart from '../../common/SimpleDimensionsChart';

const mapStateToProps = state => ({
    data: state.magnetometer.data,
});

const MagnetometerWidget = ({ data, yDomain, xDomain }) => (
    <SimpleDimensionsChart
        type="magnetometer"
        units="µT"
        data={data}
    />
);

export default connect(mapStateToProps)(MagnetometerWidget);
