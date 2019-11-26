import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { SnackbarProvider } from 'notistack';


ReactDOM.render(

  <SnackbarProvider maxSnack={5}>
    <App />
  </SnackbarProvider>,
  document.getElementById('root')

);
