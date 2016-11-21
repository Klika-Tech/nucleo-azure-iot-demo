import 'file?name=[name].[ext]!./index.html';
import React from 'react';
import { render } from 'react-dom';
import './main.scss';
import './rubix/sass/main.scss';
import Router from './components/router';

render((<Router />), document.getElementById('root'));
