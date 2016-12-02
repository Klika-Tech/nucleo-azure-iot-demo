import React, { Component } from 'react';
import { connect } from 'react-redux';
import DimensionsChart from '../common/DimensionsChart';
import { accelerometerFocusMove, accelerometerFocusOut, accelerometerBrushEnd } from '../../actions/accelerometer';

const mapStateToProps = state => ({
    data: state.accelerometer.data,
    yDomain: state.accelerometer.yDomain,
    focusDomain: state.accelerometer.focusDomain,
    contextDomain: state.accelerometer.contextDomain,
    brushSelection: state.accelerometer.brushSelection,
    cursorIndex: state.accelerometer.cursorIndex,
    cursorX: state.accelerometer.cursorX,
    cursorVisible: state.accelerometer.cursorVisible,
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
        dispatch(accelerometerFocusMove(data, xScale, xPos));
    }

    handleMouseOut() {
        const { dispatch } = this.props;
        dispatch(accelerometerFocusOut());
    }

    handleBrushEnd(xScale, selection) {
        const { dispatch } = this.props;
        dispatch(accelerometerBrushEnd(xScale, selection));
    }

    render() {
        const {
            data, yDomain, focusDomain, contextDomain, brushSelection, cursorIndex, cursorX, cursorVisible, dispatch,
        } = this.props;
        return (
            <DimensionsChart
                dispatch={dispatch}
                type="accelerometer"
                data={data}
                yDomain={yDomain}
                yUnits="g"
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
