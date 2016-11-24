import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

class Focus extends Component {

    componentDidMount() { this.addListeners(); }

    addListeners() {
        const { onMouseMove, onMouseOut, onWheel, margin } = this.props;
        const node = ReactDOM.findDOMNode(this);
        const g = d3.select(node);
        if (onMouseMove) {
            g.on('mousemove', () => {
                let [x, y] = d3.mouse(g.node());
                x -= margin.left;
                y -= margin.top;
                console.log('mousemove', [x, y]);
                onMouseMove.call({}, x, y);
            });
        }
        if (onMouseOut) {
            g.on('mouseout', () => {
                onMouseOut.call();
            });
        }
        if (onWheel) {
            g.on('wheel', () => {
                onWheel.call();
            });
        }
    }

    render() {
        const { margin, children } = this.props;
        return (
            <g className="focus" transform={`translate(${margin.left},${margin.top})`}>
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
