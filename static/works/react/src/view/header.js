/**
 * Created by Administrator on 2018/3/7.
 */
import React from 'react';
import Component from '../lib/component';
import {connect} from 'react-redux';


class Header extends Component{
    render(){
        return <div className="header">
            <div className="username">{this.props.data.username}</div>
        </div>
    }
}



export default connect((state) => wt.extend(true,{},{
    data:state.headerData
}))(Header)