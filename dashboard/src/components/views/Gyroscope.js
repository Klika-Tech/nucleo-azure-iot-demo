import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DEGREES } from '../../scaleUnits';
import DimensionsChart from '../common/DimensionsChart';

const mapStateToProps = state => ({
    data: state.gyroscope.data,
});

const Gyroscope = ({ data }) => (
    <DimensionsChart
            type="gyroscope"
            units={DEGREES}
            data={data}
    />
);

export default connect(mapStateToProps)(Gyroscope);
