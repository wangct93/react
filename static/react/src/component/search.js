/**
 * Created by Administrator on 2018/3/7.
 */
import React from 'react';
import Component from '../lib/component';

export default class Search extends Component{
    render(){
        let {placeholder = '请输入查询关键词'} = this.props;
        let {keyup,search} = this;
        return <div className="search-box">
            <input className="search-input fit" ref="input" onKeyUp={keyup.bind(this)} placeholder={placeholder}/>
            <i className="search-btn iconfont icon-chaxun" onClick={search.bind(this)}/>
        </div>;
    }
    keyup(e){
        if(e.keyCode === 13){
            this.search();
        }
    }
    search(){
        wt.execFunc(this.props.search,this.refs.input.value);
    }
}