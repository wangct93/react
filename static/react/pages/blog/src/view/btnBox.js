/**
 * Created by Administrator on 2018/3/22.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';

class BtnBox extends Component{
    render(){
        let {data = {}} = this.props;
        let {prevChapterId,bookId,nextChapterId} = data;
        let list = [
            {
                title:'上一章',
                url:prevChapterId ? './index.html?chapterId=' + prevChapterId : ''
            },
            {
                title:'返回目录',
                url:'../novel/index.html?bookId=' + bookId
            },
            {
                title:'下一章',
                url:nextChapterId ? './index.html?chapterId=' + nextChapterId : ''
            }
        ]
        return <div className="btn-box">
            {
                list.map((item,i) => {
                    let {url,title} = item;
                    return <a onClick={this.click.bind(this,url)} className="c-btn" key={i}>{url ? title : '没有' + title}</a>
                })
            }
        </div>
    }
    click(url){
        if(url){
            location.href = url;
        }
    }
}

export default connect((state) => state.chapterData)(BtnBox)