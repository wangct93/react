/**
 * Created by Administrator on 2018/3/22.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';

class Comment extends Component{
    render(){
        return <div>
            dddd
        </div>;
    }
}
export default connect((state) => ({}))(Comment)