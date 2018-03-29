/**
 * Created by Administrator on 2018/3/19.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';

import {HashRouter,Switch,Route,NavLink,withRouter,Redirect} from 'react-router-dom';

import * as actionObj from '../store/blog/action';
import {Story} from './story';

import {BlogListView,BlogTableView} from '../component/list';

const Content = () => {
    return <Switch>
        <Route path="/table" component={TableView}/>
        <Route path="/list" component={ListView}/>
        <Redirect to="/table"/>
    </Switch>;
};

const TableView = connect(state => state.blogData)((props) => {
    let {data,params = {}} = props;
    let {num = 1,size = 10} = params;
    data.forEach((item,i) => {
        item.orderNum = (num - 1) * size + 1 + i;
    });
    return <BlogTableView data={data} />;
});
const ListView = connect(state => state.blogData)(BlogListView);

export default connect((state) => wt.extend({
    Content
},state.blogData),actionObj)(Story)