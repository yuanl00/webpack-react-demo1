
/* eslint-disable */
import React from 'react';

import ReactDom from 'react-dom';
import getRouter from './router';
if (module.hot) {
  // 实现热更新
  module.hot.accept();
}
ReactDom.render(getRouter(), document.getElementById('root'));
