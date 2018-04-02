/**
 * Created by Administrator on 2018/3/7.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';
import * as actions from '../store/nav/action';

export default class LeftNav extends Component{
    render(){
        return <div className="left-box">
            <div className="left-title">导航列表</div>
            <NavListView list={this.props.list}/>
        </div>
    }
}


class NavList extends Component{
    render(){
        return <ul className="left-nav-list">
            {
                this.props.list.map((item,i) => {
                    return <li onClick={this.props.changeNav.bind(this,i)} key={i} className={item.selected ? 'active' : ''}>{item.title}</li>
                })
            }
        </ul>
    }
}
let NavListView = connect((state) => ({}),actions)(NavList);
