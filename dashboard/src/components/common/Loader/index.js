import React from 'react';
import './style.scss';

const loader = require('./bars.svg');

const Loader = () => (
    <svg>
        <use xlinkHref={loader} />
    </svg>
);

export default Loader;
