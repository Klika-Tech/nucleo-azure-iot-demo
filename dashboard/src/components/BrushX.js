import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

class BrushX extends Component {
    constructor(props) {
        super(props);
        this.brush = d3.brushX();
        this.renderBrush = this.renderBrush.bind(this);
        this.moveBrush = this.moveBrush.bind(this);
    }
    componentDidMount() { this.renderBrush(); }
    componentDidUpdate() { this.moveBrush(); }
    moveBrush() {
        const { selectionFrom, selectionTo } = this.props;
        if ((selectionFrom !== undefined)
            && (selectionTo !== undefined)) {
            const selection = d3.brushSelection(this.g.node());
            if (!selection) return;
            this.move(this.g, [selectionFrom, selectionTo]);
        }
    }
    renderBrush() {
        const { width, height, onBrushEnd } = this.props;
        const node = ReactDOM.findDOMNode(this);
        this.brush.extent([[0, 0], [width, height]]);
        this.brush.on('brush end', brushed);
        this.g = d3.select(node);
        this.g.call(this.brush);

        function brushed() {
            if (!d3.event.sourceEvent) return; // Only transition after input.
            if (!d3.event.selection) return; // Ignore empty selections.
            onBrushEnd.call({}, d3.event.selection);
        }
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
    selectionFrom: PropTypes.number,
    selectionTo: PropTypes.number,
    height: PropTypes.number,
    width: PropTypes.number,
    onBrushEnd: PropTypes.func,
};

export default BrushX;
