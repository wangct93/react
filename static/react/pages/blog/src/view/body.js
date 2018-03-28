/**
 * Created by Administrator on 2018/3/22.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider,connect} from 'react-redux';
import * as actionObj from '../store/blog/action';

class Body extends Component{
    render(){
        let {source,name,content,prev = {},next = {}} = this.props.data || {};
        return <div className="body">
            <div className="center-area">
                <div className="content">
                    <div className="other-box">
                        <div className="source-box">
                            <span>原文地址：</span>
                            <a href={source} className="text-btn" target="_blank">{source}</a>
                        </div>
                        <div className="max">
                            <div>
                                <span>上一篇：</span>
                                {
                                    prev.id ? <a className="text-btn" title={prev.name} onClick={this.toNewBlog.bind(this,prev.id)}>{prev.name}</a> : <span>无</span>
                                }
                            </div>
                            <div>
                                <span>下一篇：</span>
                                {
                                    next.id ? <a className="text-btn" title={next.name} onClick={this.toNewBlog.bind(this,next.id)}>{next.name}</a> : <span>无</span>
                                }
                            </div>
                        </div>
                    </div>
                    <h2>
                        {name}
                    </h2>
                    <div className="content-text ryf-content" dangerouslySetInnerHTML={{
                        __html:content
                    }}></div>
                </div>
            </div>
        </div>
    }
    toNewBlog(id){
        location.href = './index.html?blogId=' + id;
    }
    componentDidMount(){
        this.props.requestInfo();
    }
}


export default connect((state) => state.blogData,actionObj)(Body)