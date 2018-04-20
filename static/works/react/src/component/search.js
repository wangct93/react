/**
 * Created by Administrator on 2018/3/7.
 */
import React from 'react';
import Component from '../lib/component';

export default class Search extends Component{
    render(){
        return <div className="search-box">
            <input className="search-input fit" ref="input" onKeyUp={this.keyUp.bind(this)} placeholder="请输入查询关键词"/>
            <a className="search-btn iconfont icon-chaxun" onClick={this.search}></a>
        </div>;
    }
    keyUp(e){
        if(e.keyCode == 13){
            this.search();
        }
    }
    search(){
        var keyword = this.refs.input.value;
        wt.execFunc(this.props.search,keyword);
    }
}