/**
 * Created by Administrator on 2018/3/7.
 */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import Demo from './views/demo';
import store from './store/store';


render(<Provider store={store}>
    <Demo/>
</Provider>,$('#container')[0]);