import React, { Component, PropTypes } from 'react';
import * as d3 from 'd3';

class Area extends Component {
    constructor(props) {
        super(props);
        this.generator = d3.area()
            .y0(this.props.y0)
            .y1(this.props.y1)
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
            <path className="area" d={this.generator(this.props.data)} />
        );
    }
}

Area.propTypes = {
    data: PropTypes.array,
    x: PropTypes.func,
    y0: PropTypes.func,
    y1: PropTypes.func,
    skipRenderCount: PropTypes.number,
};

Area.contextTypes = {
    containerHeight: PropTypes.number,
    containerWidth: PropTypes.number,
};

export default Area;
