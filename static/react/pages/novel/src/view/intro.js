/**
 * Created by Administrator on 2018/3/22.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';


class Intro extends Component{
    render(){
        let {info = {}} = this.props;
        let {intro = ''} = info;
        return <div className="intro-box">{intro.replace(/^\s*\n*|\s*\n*$/g,'').split(/\s*\n\s*/).map((item,i) => {
            return <p key={i}>{item}</p>;
        })}</div>;
    }
}


export default connect((state) => ({info:state.novelData.info}))(Intro);