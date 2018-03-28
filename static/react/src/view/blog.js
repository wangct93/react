/**
 * Created by Administrator on 2018/3/19.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';

import SeachBox from '../component/search';
import LoadingBox from '../component/loading';
import Paging from "../component/paging";
import Table from '../component/table';
import Panel from '../component/navPanel';
import {StoryTableView,StoryListView} from '../component/list';

import {HashRouter,Switch,Route,NavLink,withRouter,Redirect} from 'react-router-dom';


import * as actionObj from '../store/story/action';

import {getPaging} from '../compute/compute';

class Story extends Component{

    render(){
        let {search,isLoading,turnPage,sortList,viewList,match} = this.props;
        return <div className="story-box">
            <div className="center-area">
                <div className="search-wrap">
                    <SeachBox search={search}/>
                </div>
                <div className="story-control-box">
                    <span className="story-title">列表</span>
                    {/*<ul className="sort-box">*/}
                        {/*{*/}
                            {/*sortList.map((item,i) => {*/}
                                {/*let {desc,text} = item;*/}
                                {/*return <li key={i} className={desc ? 'desc' : ''}>*/}
                                    {/*{text}*/}

                                {/*</li>*/}
                            {/*})*/}
                        {/*}*/}
                    {/*</ul>*/}
                    <ViewNav list={viewList} />
                </div>
                <div className="story-content">
                    <HashRouter basename={match.url}>
                        <Switch>
                            <Route path="/table" component={TableView}/>
                            <Route path="/list" component={ListView}/>
                            <Redirect to="/table"/>
                        </Switch>
                    </HashRouter>
                    <LoadingBox show={isLoading}/>
                </div>
                <Paging onSelect={turnPage.bind(this)} option={getPaging(this.props)}/>
            </div>
        </div>
    }

    getStartOrder(){
        let {num,size} = this.props.params;
        return (num - 1) * size;
    }
    componentDidMount(){
        this.props.turnPage(1,10);
    }
}

const ViewNav = withRouter(({match,list}) => {
    let basePath = match.url;
    if(basePath === '/'){
        basePath = '';
    }
    return <nav className="view-btn-list">
        {
            list.map(({path,iconCls},i) => {
                return <NavLink key={i} to={basePath + path}><i className={`iconfont ${iconCls}`}></i></NavLink>
            })
        }
    </nav>
})





const TableView = connect(state => state.storyData)((props) => {
    let {data,params = {}} = props;
    let {num = 1,size = 10} = params;
    data.forEach((item,i) => {
        item.orderNum = (num - 1) * size + 1 + i;
    });
    return <StoryTableView data={data} />;
});
const ListView = connect(state => state.storyData)(StoryListView);

export default connect((state) => state.storyData,actionObj)(Story)