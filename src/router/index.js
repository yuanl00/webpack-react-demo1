import React from 'react'
import { HashRouter as Router, Route, Switch, Link } from 'react-router-dom'
import Home from '../pages/Home.jsx'
import Page1 from '../pages/Page1'

const getRouter = () => (
  <Router>
    <div>
      <ul>
        <li>
          <Link to="/">首页1</Link>
        </li>
        <li>
          <Link to="/page1">Page12</Link>
        </li>
      </ul>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/page1" component={Page1} />
      </Switch>
    </div>
  </Router>
);
export default getRouter
