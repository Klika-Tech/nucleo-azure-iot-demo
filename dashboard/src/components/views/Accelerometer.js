import React, { Component } from 'react';
import { connect } from 'react-redux';
import DimensionsChart from '../common/DimensionsChart';
import { accelerometerBrushEnd } from '../../actions/accelerometer';

const mapStateToProps = state => ({
    data: state.accelerometer.data,
    yDomain: state.accelerometer.yDomain,
    focusDomain: state.accelerometer.focusDomain,
    contextDomain: state.accelerometer.contextDomain,
    brushSelection: state.accelerometer.brushSelection,
});

class Accelerometer extends Component {

    constructor(props) {
        super(props);
        this.handleBrushEnd = this.handleBrushEnd.bind(this);
    }

    handleBrushEnd(xScale, selection) {
        const { dispatch } = this.props;
        dispatch(accelerometerBrushEnd(xScale, selection));
    }

    render() {
        const { data, yDomain, focusDomain, contextDomain, brushSelection } = this.props;
        return (
            <DimensionsChart
                type="accelerometer"
                units="g"
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
