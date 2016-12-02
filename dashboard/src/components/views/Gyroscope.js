import React, { Component } from 'react';
import { connect } from 'react-redux';
import DimensionsChart from '../common/DimensionsChart';
import { gyroscopeFocusMove, gyroscopeFocusOut, gyroscopeBrushEnd } from '../../actions/gyroscope';

const mapStateToProps = state => ({
    data: state.gyroscope.data,
    yDomain: state.gyroscope.yDomain,
    focusDomain: state.gyroscope.focusDomain,
    contextDomain: state.gyroscope.contextDomain,
    brushSelection: state.gyroscope.brushSelection,
    cursorIndex: state.gyroscope.cursorIndex,
    cursorX: state.gyroscope.cursorX,
    cursorVisible: state.gyroscope.cursorVisible,
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
        dispatch(gyroscopeFocusMove(data, xScale, xPos));
    }

    handleMouseOut() {
        const { dispatch } = this.props;
        dispatch(gyroscopeFocusOut());
    }

    handleBrushEnd(xScale, selection) {
        const { dispatch } = this.props;
        dispatch(gyroscopeBrushEnd(xScale, selection));
    }

    render() {
        const {
            data, yDomain, focusDomain, contextDomain, brushSelection, cursorIndex, cursorX, cursorVisible, dispatch,
        } = this.props;
        return (
            <DimensionsChart
                dispatch={dispatch}
                type="gyroscope"
                data={data}
                yDomain={yDomain}
                yUnits="°"
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
