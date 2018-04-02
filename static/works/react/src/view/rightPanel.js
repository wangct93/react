/**
 * Created by Administrator on 2018/3/7.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';
import NavPanel from '../component/navPanel';

export default class RightPanel extends Component{
    render(){
        return <div className="right-box">
            <NavPanel list={this.props.list}/>
        </div>
    }
}