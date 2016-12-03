import React, { Component } from 'react';
import { connect } from 'react-redux';
import DimensionsChart from '../common/DimensionsChart';

const mapStateToProps = state => ({
    data: state.magnetometer.data,
});

const Magnetometer = ({ data }) => {
    return (
        <DimensionsChart
            type="magnetometer"
            units="µT"
            data={data}
        />
    );
};

export default connect(mapStateToProps)(Magnetometer);
