/**
 * Created by Administrator on 2018/3/22.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';
import * as actionObj from '../store/novel/action';

class NovelInfo extends Component{
    render(){
        let {data = {}} = this.props;
        return <div className="info-container mgb25">
            <div className="imgbox">
                <img src="/static/blog_react/img/1.jpg" />
            </div>
            <div className="info-box">
                <h2>
                    <span>{data.name}</span>
                    <small>{data.author} 著</small>
                </h2>
                <div className="type-box">
                    <div className="type-item">{data.state == '1' ? '完本' : '连载中'}</div>
                    <div className="type-item">连载</div>
                    <div className="type-item">连载</div>
                    <div className="type-item">连载</div>
                </div>
                <div className="info-expain">{data.expain}</div>
                <div className="info-state">
                    <div>132万字</div>
                </div>
                <div className="btn-box">
                    <div className="btn-left">
                        <a className="w-btn info-btn">开始阅读</a>
                    </div>
                    <div className="btn-right">
                        <a className="">
                            <i className="iconfont icon-arrow-top"></i>
                            <span>批阅</span>
                        </a>
                        <span className="mglr10">|</span>
                        <a className="">
                            <i className="iconfont icon-arrow-top"></i>
                            <span>下载</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    }
    componentDidMount(){
        this.props.requestInfo();
    }
}


export default connect((state) => ({
    data:state.novelData.info
}),actionObj)(NovelInfo);