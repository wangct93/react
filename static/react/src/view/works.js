/**
 * Created by Administrator on 2018/3/19.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';

import {HashRouter,Switch,Route,NavLink,withRouter,Redirect} from 'react-router-dom';

import * as actionObj from '../store/works/action';
import {Story} from './story';

import {BlogListView,WorksTableView} from '../component/list';

const Content = () => {
    return <Switch>
        <Route path="/table" component={TableView}/>
        <Route path="/list" component={ListView}/>
        <Redirect to="/table"/>
    </Switch>;
};

const TableView = connect(state => state.worksData)((props) => {
    let {data,params = {}} = props;
    let {num = 1,size = 10} = params;
    data.forEach((item,i) => {
        item.orderNum = (num - 1) * size + 1 + i;
    });
    return <WorksTableView data={data} />;
});
const ListView = connect(state => {
    let {data} = state.worksData;
    data = wt.clone(data);
    data.forEach(item => {
        item.content = item.intro;
    });
    return {
        data
    }
})(BlogListView);

export default connect((state) => wt.extend({
    Content
},state.worksData),actionObj)(Story)