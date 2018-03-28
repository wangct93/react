/**
 * Created by Administrator on 2018/3/27.
 */
import React from 'react';
import Component from '../lib/component';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';

import {HashRouter,Switch,Route,Link,withRouter,Redirect} from 'react-router-dom';

import Header from '../view/header';
import Home from '../view/home';
import Story from '../view/story';
import Blog from '../view/blog';

export default class Router extends Component{
    render(){
        return <HashRouter>
            <div>
                <Header />
                <Switch>
                    <Route path="/home" component={Home}/>
                    <Route path="/story" component={Story}/>
                    <Route path="/blog" component={Blog}/>
                    <Redirect to="/home"/>
                </Switch>
            </div>
        </HashRouter>
    }
}