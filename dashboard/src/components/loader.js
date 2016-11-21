import React from 'react';

const oval = require('../assets/oval.svg');

const Loader = () => (
  <svg>
    <use xlinkHref={oval} />
  </svg>
);

export default Loader;
