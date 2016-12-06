import React, { Component, PropTypes } from 'react';
import * as d3 from 'd3';

class Curve extends Component {
    constructor(props) {
        super(props);
        this.generator = d3.line()
            .curve(props.type || d3.curveLinear)
            .y(this.props.y)
            .x(this.props.x);
        this.renderCounter = props.skipRenderCount;
    }

    shouldComponentUpdate(newProps, newState, nextContext) {
        const shouldComponentUpdate = (this.props.data !== newProps.data)
            || (this.context.containerWidth !== nextContext.containerWidth)
            || (this.context.containerHeight !== nextContext.containerHeight);
        let shouldRender = true;
        if (newProps.skipRenderCount !== undefined) {
            shouldRender = this.renderCounter <= 0;
            if (shouldRender) {
                this.renderCounter = newProps.skipRenderCount;
            } else {
                this.renderCounter -= 1;
            }
        }
        return shouldComponentUpdate && shouldRender;
    }

    render() {
        return (
            <path className={`line ${this.props.className}`} d={this.generator(this.props.data)} />
        );
    }
}

Curve.propTypes = {
    data: PropTypes.array,
    type: PropTypes.function,
    x: PropTypes.func,
    y: PropTypes.func,
    className: PropTypes.string,
    skipRenderCount: PropTypes.number,
};

Curve.contextTypes = {
    containerHeight: PropTypes.number,
    containerWidth: PropTypes.number,
};

export default Curve;
