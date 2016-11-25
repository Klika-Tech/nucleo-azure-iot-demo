import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import { axisBottom, axisRight } from 'd3-axis';

class Axis extends Component {
    constructor(props) {
        super(props);
        this.renderAxis = this.renderAxis.bind(this);
        this.axis = (props.type === 'x') ? axisBottom() : axisRight();
        this.axis.scale(props.scale);
        if (props.tickFormat) {
            this.axis.tickFormat(props.tickFormat);
        }
    }

    componentDidMount() { this.renderAxis(); }

    shouldComponentUpdate(newProps, newState, nextContext) {
        return (this.props.data !== newProps.data)
            || (this.context.containerWidth !== nextContext.containerWidth)
            || (this.context.containerHeight !== nextContext.containerHeight);
    }

    componentDidUpdate() {
        this.renderAxis();
    }

    renderAxis() {
        const { axis } = this;
        const { type, tickSize } = this.props;
        const node = ReactDOM.findDOMNode(this);
        const g = d3.select(node);
        if (tickSize) {
            axis.tickSize(tickSize);
        }
        g.call(axis);
        if (type === 'y') {
            g.selectAll('text').attr('x', 4).attr('dy', -4);
        }
    }

    render() {
        const { type, translate } = this.props;
        return (
            <g
                className={`${type} axis`}
                transform={(translate) ? `translate(${translate.join(',')})` : null}
            />
        );
    }
}

Axis.propTypes = {
    data: PropTypes.array,
    type: PropTypes.oneOf(['x', 'y']),
    scale: PropTypes.func,
    tickFormat: PropTypes.func,
    tickSize: PropTypes.number,
    translate: PropTypes.arrayOf(PropTypes.number),
};

Axis.contextTypes = {
    containerHeight: PropTypes.number,
    containerWidth: PropTypes.number,
};

Axis.defaultProps = {
    translateX: 0,
    translateY: 0,
};

export default Axis;
