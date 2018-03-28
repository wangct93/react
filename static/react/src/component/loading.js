/**
 * Created by Administrator on 2018/3/19.
 */
import React from 'react';
import Component from '../lib/component';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';

export default class LoadingBox extends Component{
    render(){
        return <div className="loading-wrap v-mid-box pos-abs fit text-center" style={{
            display:this.props.show ? 'block' : 'none'
        }}>
            <div className="process-text">{this.props.message || '数据加载中......'}</div>
        </div>
    }
}