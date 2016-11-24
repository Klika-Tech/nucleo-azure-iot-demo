import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

class Focus extends Component {
    constructor(props) {
        super(props);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }
    handleMouseMove(e) {
        const { onMouseMove, margin } = this.props;
        let [x, y] = [e.clientX, e.clientY];
        x -= margin.left + 300; // TODO: refactoring
        y -= margin.top;
        onMouseMove.call({}, x, y);
    }
    render() {
        const { margin, children } = this.props;
        return (
            <g
                className="focus"
                transform={`translate(${margin.left},${margin.top})`}
                onMouseMove={this.handleMouseMove}
            >
                {children}
            </g>
        );
    }
}

Focus.propTypes = {
    margin: PropTypes.shape({
        left: PropTypes.number,
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
    }),
    onMouseMove: PropTypes.func,
    onMouseOut: PropTypes.func,
    onWheel: PropTypes.func,
};


export default Focus;
