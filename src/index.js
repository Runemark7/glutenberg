import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import './globals';
import Editor from './pages/editor';
import Preview from './pages/preview';
import './globals/url';



ReactDOM.render((
  <BrowserRouter>
    <Switch>
      <Route exact path="/preview" component={ Preview } />
      <Route exact path="/posts" component={ Editor } />
      <Route exact path="/pages" component={ Editor } />
      <Route component={ Editor } />
    </Switch>
  </BrowserRouter>
), document.getElementById('root'));

