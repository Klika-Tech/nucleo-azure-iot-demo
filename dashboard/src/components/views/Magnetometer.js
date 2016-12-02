import React, { Component } from 'react';
import { connect } from 'react-redux';
import DimensionsChart from '../common/DimensionsChart';
import { magnetometerFocusMove, magnetometerFocusOut, magnetometerBrushEnd } from '../../actions/magnetometer';

const mapStateToProps = state => ({
    data: state.magnetometer.data,
    yDomain: state.magnetometer.yDomain,
    focusDomain: state.magnetometer.focusDomain,
    contextDomain: state.magnetometer.contextDomain,
    brushSelection: state.magnetometer.brushSelection,
    cursorIndex: state.magnetometer.cursorIndex,
    cursorX: state.magnetometer.cursorX,
    cursorVisible: state.magnetometer.cursorVisible,
});

class Accelerometer extends Component {

    constructor(props) {
        super(props);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleBrushEnd = this.handleBrushEnd.bind(this);
    }

    handleMouseMove(data, xScale, xPos) {
        const { dispatch } = this.props;
        dispatch(magnetometerFocusMove(data, xScale, xPos));
    }

    handleMouseOut() {
        const { dispatch } = this.props;
        dispatch(magnetometerFocusOut());
    }

    handleBrushEnd(xScale, selection) {
        const { dispatch } = this.props;
        dispatch(magnetometerBrushEnd(xScale, selection));
    }

    render() {
        const {
            data, yDomain, focusDomain, contextDomain, brushSelection, cursorIndex, cursorX, cursorVisible, dispatch,
        } = this.props;
        return (
            <DimensionsChart
                dispatch={dispatch}
                type="magnetometer"
                data={data}
                yDomain={yDomain}
                yUnits="µT"
                focusDomain={focusDomain}
                contextDomain={contextDomain}
                brushSelection={brushSelection}
                cursorIndex={cursorIndex}
                cursorX={cursorX}
                cursorVisible={cursorVisible}
                onMouseMove={this.handleMouseMove}
                onMouseOut={this.handleMouseOut}
                onBrushEnd={this.handleBrushEnd}
            />
        );
    }
}


export default connect(mapStateToProps)(Accelerometer);
