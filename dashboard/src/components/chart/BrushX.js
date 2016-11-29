import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

class BrushX extends Component {
    constructor(props) {
        super(props);
        this.brush = d3.brushX();
        this.renderBrush = this.renderBrush.bind(this);
        this.brushed = this.brushed.bind(this);
    }
    componentDidMount() { this.renderBrush(); }
    shouldComponentUpdate() {
        return false;
    }
    brushed() {
        const { onBrushEnd } = this.props;
        // if (!d3.event.sourceEvent) return; // Only transition after input.
        // if (!d3.event.selection) return; // Ignore empty selections.
        onBrushEnd.call({}, d3.event.selection);
    }
    renderBrush() {
        const { brush } = this;
        const { width, height, onBrushMount } = this.props;
        const node = ReactDOM.findDOMNode(this);
        const g = d3.select(node);
        brush.extent([[0, 0], [width, height]]);
        brush.on('brush end', this.brushed);
        g.call(brush);
        const moveBrush = function (selection) {
            brush.move(g, selection);
        };
        onBrushMount.call({}, { moveBrush });
    }
    render() {
        const { children } = this.props;
        return (
            <g className="brush">
                {children}
            </g>
        );
    }
}

BrushX.propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    onBrushMount: PropTypes.func,
    onBrushEnd: PropTypes.func,
};

export default BrushX;
