/**
 * Created by Administrator on 2018/3/22.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider,connect} from 'react-redux';
import * as actionObj from '../store/chapter/action';
import BtnBox from './btnBox';

class Body extends Component{
    render(){
        let {name,text = ''} = this.props.data || {};
        return <div className="body">
            <div className="center-area">
                <div className="content">
                    <h2>{name}</h2>
                    <BtnBox />
                    <div className="content-text">
                        {
                            text.replace(/^\s*\n*|\s*\n*$/g,'').split(/\s+/).map((item,i) => {
                                return <p key={i}>{item}</p>;
                            })
                        }
                    </div>
                    <BtnBox />
                </div>
            </div>
        </div>
    }
    componentDidMount(){
        this.props.requestInfo();
    }
}


export default connect((state) => state.chapterData,actionObj)(Body)