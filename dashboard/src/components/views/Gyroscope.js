import React, { Component } from 'react';
import { connect } from 'react-redux';
import DimensionsChart from '../common/DimensionsChart';

const mapStateToProps = state => ({
    data: state.gyroscope.data,
});

const Gyroscope = ({ data }) => {
    return (
        <DimensionsChart
            type="gyroscope"
            units="°"
            data={data}
        />
    );
};

export default connect(mapStateToProps)(Gyroscope);
