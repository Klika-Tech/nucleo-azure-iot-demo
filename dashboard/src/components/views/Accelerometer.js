import React, { Component } from 'react';
import { connect } from 'react-redux';
import DimensionsChart from '../common/DimensionsChart';

const mapStateToProps = state => ({
    data: state.accelerometer.data,
});

const Accelerometer = ({ data }) => {
    return (
        <DimensionsChart
            type="accelerometer"
            units="g"
            data={data}
        />
    );
};

export default connect(mapStateToProps)(Accelerometer);
