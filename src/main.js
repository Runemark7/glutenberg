import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import './globals';
import Editor from './pages/editor';


ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/posts" component={ Editor } />
      <Route exact path="/pages" component={ Editor } />
      <Route component={ Editor } />
    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);
