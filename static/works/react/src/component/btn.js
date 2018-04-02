/**
 * Created by Administrator on 2018/3/13.
 */
import React from 'react';
import Component from '../lib/component';

export default class Btn extends Component{
    render(){
        return <a className="w-btn" onClick={this.props.click}>
            {
                this.props.iconCls && <i className={`iconfont ${this.props.iconCls}`}></i>
            }
            {this.props.text}
        </a>;
    }
}
