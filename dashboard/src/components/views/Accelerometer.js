import React, { Component } from 'react';
import { connect } from 'react-redux';
import { G } from '../../scaleUnits';
import DimensionsChart from '../common/DimensionsChart';

const mapStateToProps = state => ({
    data: state.accelerometer.data,
});

const Accelerometer = ({ data }) => (
    <DimensionsChart
            type="accelerometer"
            units={G}
            data={data}
    />
);

export default connect(mapStateToProps)(Accelerometer);
