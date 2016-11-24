import React, { Component, PropTypes } from 'react';
import lineOptimized from '../services/lineOptimized';

class Line extends Component {
    constructor(props) {
        super(props);
        this.generator = lineOptimized()
            .y(this.props.y)
            .x(this.props.x);
    }

    componentWillReceiveProps(newProps) {
        this.d = this.generator(newProps.data);
    }

    render() {
        return (
            <path className={`line ${this.props.className}`} d={this.d} />
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
