/**
 * Created by Administrator on 2018/3/7.
 */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import Paging from '../component/paging';
import * as createActions from '../store/demo/action';

class Demo extends Component{
    render(){
        return <div>
            <Paging/>
            <div onClick={this.click.bind(this)}>
                {
                    this.props.data.name
                }
            </div>
        </div>
    }
    click(){
        this.props.changeName('wangchuitog');
    }
}

export default connect((state) => ({
    data:state.demoData
}),createActions)(Demo);