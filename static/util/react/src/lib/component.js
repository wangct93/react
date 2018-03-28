/**
 * Created by Administrator on 2018/3/8.
 */

import React,{Component} from 'react';
export default class ReactComponent extends Component{
    shouldComponentUpdate(props,state){
        return !wt.equal(this.props,props) || !wt.equal(this.state,state);
    }
}