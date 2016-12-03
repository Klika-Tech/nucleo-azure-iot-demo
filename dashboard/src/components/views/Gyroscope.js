import React, { Component } from 'react';
import { connect } from 'react-redux';
import DimensionsChart from '../common/DimensionsChart';
import { gyroscopeBrushEnd } from '../../actions/gyroscope';

const mapStateToProps = state => ({
    data: state.gyroscope.data,
    yDomain: state.gyroscope.yDomain,
    focusDomain: state.gyroscope.focusDomain,
    contextDomain: state.gyroscope.contextDomain,
    brushSelection: state.gyroscope.brushSelection,
});

class Accelerometer extends Component {

    constructor(props) {
        super(props);
        this.handleBrushEnd = this.handleBrushEnd.bind(this);
    }

    handleBrushEnd(xScale, selection) {
        const { dispatch } = this.props;
        dispatch(gyroscopeBrushEnd(xScale, selection));
    }

    render() {
        const { data, yDomain, focusDomain, contextDomain, brushSelection } = this.props;
        return (
            <DimensionsChart
                type="gyroscope"
                units="°"
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
