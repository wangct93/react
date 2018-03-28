/**
 * Created by Administrator on 2018/3/19.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';

import * as actionObj from '../store/home/action';
import LoadingBox from "../component/loading";
import {HomeList} from '../component/list';


class Home extends Component{
    render(){
        let {menuList,changeNav,data,isLoading} = this.props;
        return <div className="home-box">
            <div className="explain-box">
                <h3>这里是测试标题</h3>
            </div>
            <div className="center-area">
                <ul className="nav-bg-list flex-box mgt20">
                    {
                        menuList.map((item,i) => {
                            let {title,iconCls,selected} = item;
                            return <li onClick={changeNav.bind(this,i)} key={i} className={selected ? 'active' : ''}>
                                <i className={`iconfont ${iconCls}`}></i>
                                <span>{title}</span>
                            </li>
                        })
                    }
                </ul>
                <div className="home-content pos-rel">
                    <HomeList data={data}/>
                    <LoadingBox show={isLoading}/>
                </div>
            </div>
        </div>
    }
    componentDidMount(){
        this.props.changeNav(0);
    }
}


export default connect((state) => state.homeData,actionObj)(Home)