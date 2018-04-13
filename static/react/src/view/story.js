/**
 * Created by Administrator on 2018/3/19.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';

import SeachBox from '../component/search';
import LoadingBox from '../component/loading';
import Paging from "../component/paging";
import Combobox from '../component/combobox';
import {StoryTableView,StoryListView} from '../component/list';

import {HashRouter,Switch,Route,NavLink,withRouter,Redirect} from 'react-router-dom';


import * as actionObj from '../store/story/action';

import {getPaging} from '../compute/compute';

export class Story extends Component{
    render(){
        let {search,isLoading,turnPage,sortList,viewList,match,changeSort,Content = StoryContent} = this.props;
        return <div className="story-box">
            <HashRouter basename={match.url}>
                <div className="center-area">
                    <div className="search-wrap">
                        <SeachBox search={search}/>
                    </div>
                    <div className="story-control-box">
                        <h2>列表</h2>
                        <div>排序：</div>
                        <Combobox data={sortList} option={{
                            width:120,
                            height:30,
                            onSelect:changeSort
                        }} />
                        <ViewNav list={viewList} />
                    </div>
                    <div className="story-content">
                        <Content />
                        <LoadingBox show={isLoading}/>
                    </div>
                    <Paging onSelect={turnPage.bind(this)} option={getPaging(this.props)}/>
                </div>
            </HashRouter>
        </div>
    }
    componentDidMount(){
        this.props.turnPage(1,10);
    }
}

const StoryContent = () => {
    return <Switch>
        <Route path="/table" component={TableView}/>
        <Route path="/list" component={ListView}/>
        <Redirect to="/table"/>
    </Switch>;
};

const ViewNav = ({list}) => {
    return <nav className="view-btn-list">
        {
            list.map(({path,iconCls},i) => {
                return <NavLink key={i} to={path}><i className={`iconfont ${iconCls}`}></i></NavLink>
            })
        }
    </nav>
};





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