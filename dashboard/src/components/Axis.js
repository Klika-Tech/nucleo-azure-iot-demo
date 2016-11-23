import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import { axisBottom, axisRight } from 'd3-axis';

class Axis extends Component {
    constructor(props) {
        super(props);
        this.axis = (props.type === 'x') ? axisBottom() : axisRight();
        this.axis.scale(props.scale);
        if (props.tickFormat) {
            this.axis.tickFormat(props.tickFormat);
        }
    }

    componentDidMount() { this.renderAxis(); }
    componentDidUpdate() { this.renderAxis(); }

    renderAxis() {
        const node = ReactDOM.findDOMNode(this);
        const g = d3.select(node);
        g.call(this.axis);
        if (this.props.type === 'y') {
            g.selectAll('text').attr('x', 4).attr('dy', -4);
        }
    }

    render() {
        return (
            <g
                className={`${this.props.type} axis`}
                transform={`translate(${this.props.translateX}, ${this.props.translateY})`}
            />
        );
    }
}

Axis.propTypes = {
    type: PropTypes.oneOf(['x', 'y']),
    scale: PropTypes.func,
    tickFormat: PropTypes.func,
    translateX: PropTypes.number,
    translateY: PropTypes.number,
};

Axis.defaultProps = {
    translateX: 0,
    translateY: 0,
};

export default Axis;
