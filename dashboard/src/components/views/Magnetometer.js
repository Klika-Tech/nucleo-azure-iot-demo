import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TESLAS } from '../../scaleUnits';
import DimensionsChart from '../common/DimensionsChart';

const mapStateToProps = state => ({
    data: state.magnetometer.data,
});

const Magnetometer = ({ data }) => (
    <DimensionsChart
            type="magnetometer"
            units={TESLAS}
            data={data}
    />
);

export default connect(mapStateToProps)(Magnetometer);
