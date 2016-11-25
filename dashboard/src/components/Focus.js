import React, { Component, PropTypes } from 'react';

class Focus extends Component {
    constructor(props) {
        super(props);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
    }
    handleMouseMove(e) {
        const { onMouseMove, margin } = this.props;
        let [x, y] = [e.clientX, e.clientY];
        x -= margin.left + 300; // TODO: refactoring
        y -= margin.top;
        onMouseMove.call({}, x, y);
    }
    handleMouseOut(e) {
        const { onMouseOut } = this.props;
        onMouseOut.call();
    }
    render() {
        const { margin, children, width, height } = this.props;
        return (
            <g
                className="focus"
                transform={`translate(${margin.left},${margin.top})`}
                onMouseMove={this.handleMouseMove}
                onMouseOut={this.handleMouseOut}
            >
                <rect className="focus-bg" x="0" y="0" width={width} height={height} />
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
    height: PropTypes.number,
    width: PropTypes.number,
    onMouseMove: PropTypes.func,
    onMouseOut: PropTypes.func,
};


export default Focus;
