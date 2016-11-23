import React, { Component, PropTypes } from 'react';
import lineOptimized from '../services/lineOptimized';

class Line extends Component {
    constructor(props) {
        super(props);
        this.generator = lineOptimized()
            .y(this.props.y)
            .x(this.props.x);
    }

    render() {
        return (
            <path className={`line ${this.props.className}`} d={this.generator(this.props.data)} />
        );
    }
}

Line.propTypes = {
    data: PropTypes.array,
    x: PropTypes.func,
    y: PropTypes.func,
    className: PropTypes.string,
};

export default Line;
