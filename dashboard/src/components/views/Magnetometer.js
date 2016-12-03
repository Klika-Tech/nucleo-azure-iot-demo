import React, { Component } from 'react';
import { connect } from 'react-redux';
import DimensionsChart from '../common/DimensionsChart';
import { magnetometerBrushEnd } from '../../actions/magnetometer';

const mapStateToProps = state => ({
    data: state.magnetometer.data,
    yDomain: state.magnetometer.yDomain,
    focusDomain: state.magnetometer.focusDomain,
    contextDomain: state.magnetometer.contextDomain,
    brushSelection: state.magnetometer.brushSelection,
});

class Accelerometer extends Component {

    constructor(props) {
        super(props);
        this.handleBrushEnd = this.handleBrushEnd.bind(this);
    }

    handleBrushEnd(xScale, selection) {
        const { dispatch } = this.props;
        dispatch(magnetometerBrushEnd(xScale, selection));
    }

    render() {
        const { data, yDomain, focusDomain, contextDomain, brushSelection } = this.props;
        return (
            <DimensionsChart
                type="magnetometer"
                units="µT"
                data={data}
                yDomain={yDomain}
                focusDomain={focusDomain}
                contextDomain={contextDomain}
                brushSelection={brushSelection}
                onBrushEnd={this.handleBrushEnd}
            />
        );
    }
}

export default connect(mapStateToProps)(Accelerometer);
