/**
 * Created by Administrator on 2018/3/22.
 */
import React from 'react';
import Component from '../lib/component';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import Panel from '../../../../src/component/navPanel';

import * as actionObj from '../store/novel/action';

import {HashRouter,Route,NavLink,Switch,Redirect} from 'react-router-dom';


import Intro from './intro';
import ChapterList from './chapterList';
import Comment from './comment';

class Content extends Component{
    render(){
        let {list} = this.props;
        return <div className="content">
            <HashRouter>
                <div>
                    <ul className="nav-list">
                        {
                            list.map((item,i) => {
                                let {title} = item;
                                return <li key={i}>
                                    <NavLink to={item.path}>{title}</NavLink>
                                </li>
                            })
                        }
                    </ul>
                    <Switch>
                        <Route path="/intro" component={Intro} />
                        <Route path="/chapterList" component={ChapterList} />
                        <Route path="/comment" component={Comment} />
                        <Redirect to="/intro" />
                    </Switch>
                </div>
            </HashRouter>
        </div>
    }
}

export default connect((state) => ({
    list:state.novelData.nav
}),actionObj)(Content);