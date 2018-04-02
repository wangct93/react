/**
 * Created by Administrator on 2018/3/7.
 */
import React from 'react';
import Component from '../lib/component';
import {connect} from 'react-redux';
import LeftNav from './leftNav';
import RightPanel from './rightPanel';

class Body extends Component{
    render(){
        return <div className="body">
            <LeftNav list={this.props.list}/>
            <RightPanel list={this.props.list}/>
        </div>
    }
}

export default connect((state) => wt.extend(true,{},state.navData))(Body)

// export default connect((state) => state.navData)(Body)