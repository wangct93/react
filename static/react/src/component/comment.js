/**
 * Created by Administrator on 2018/3/29.
 */
import React from 'react';
import Component from '../lib/component';
import Paging from "./paging";

export default class Comment extends Component{
     constructor(){
         super();
         this.state = {
             data:[],
             total:0
         }
     }
    componentWillMount(){
        let {targetId} = this.props;
        this.params = {
            targetId
        }
    }
    render(){
        let {data,total} = this.state || {};
        return <div className="comment-box">
            <ul className="comment-list">
                {
                    data.map((item,i) => {
                        return <li key={i}>
                            <Item data={item} />
                        </li>
                    })
                }
            </ul>
            <Paging onSelect={this.turnPage.bind(this)} option={formatPaging(this.params,total)}/>
        </div>
    }
    componentDidMount(){
        this.turnPage(1,10);
    }
    turnPage(num,size){
        turnPage.call(this,...arguments);
    }
    refresh(){
        this.setState({
            _date:+new Date()
        });
    }
}


class Item extends Component{
    constructor(){
        super();
        this.state = {
            data:[],
            total:0
        }
    }
    componentWillMount(){
        let {id,targetId} = this.props.data;
        this.params = {
            parentId:id,
            targetId
        }
    }
    render(){
        let {username,time,content,toUserName} = this.props.data || {};
        let {turnPage,reply,changeReplyState,submit,params} = this;
        let {data,total} = this.state;
        return <div className="comment-item">
            <div className="head">
                <div className="img-box">
                    <img src="./img/1.jpg"/>
                </div>
                <div className="username">
                    <span className="text-btn">{username}</span>
                    {
                        toUserName ? <span>
                            <span className="reply-text">回复</span>
                            <span className="text-btn">{toUserName}</span>
                            ：
                        </span> : ''
                    }
                </div>
                <div className="time">{time}</div>
            </div>
            <div className="content">{content}</div>
            <div className="actions">
                <a className="c-btn text-btn" onClick={changeReplyState.bind(this)}>
                    <i className="iconfont icon-arrow-top"></i>
                    <span>回复</span>
                </a>
            </div>
            <div className="reply-box" style={{
                display:reply ? 'block' : 'none'
            }}>
                <div className="input-box" ref="input" contentEditable={true}></div>
                <div className="reply-btn-box">
                    <a className="text-btn" onClick={changeReplyState.bind(this)}>取消</a>
                    <a className="reply-btn" onClick={submit.bind(this)}>评论</a>
                </div>
                <ul className="comment-list">
                    {
                        data.map((item,i) => {
                            return <li key={i}>
                                <Item data={item} />
                            </li>
                        })
                    }
                </ul>
                <div style={{
                    display:data.length ? 'block' : 'none'
                }}>
                    <Paging search={turnPage.bind(this)} option={formatPaging(params,total)} />
                </div>
            </div>
        </div>
    }
    turnPage(){
        turnPage.call(this,...arguments);
    }
    changeReplyState(){
        this.reply = !this.reply;
        this.refresh();
        if(!this.replyloaded){
            this.replyloaded = true;
            this.turnPage(1);
        }
    }
    submit(){
        let value = this.refs.input.innerText;
        if(!value){
            alert('内容不能为空！');
        }else{
            let {params} = this;
            let {id:toUserId,username:toUserName} = this.props.data;
            $.ajax({
                url:'/submitComment',
                data:{
                    targetId:params.targetId,
                    parentId:params.parentId,
                    content:value,
                    toUserId,
                    toUserName
                },
                success:() => {
                    alert('评论成功！');
                    this.turnPage(this.params.num);
                },
                error(err){
                    console.log(err);
                    alert('评论失败！');
                }
            });
        }
    }
    refresh(){
        this.setState({
            _date:+new Date()
        });
    }
}

function request(params,cb){
    $.ajax({
        url:'/getCommentList',
        data:params,
        success:cb,
        error(err) {
            console.log(err);
            cb({
                total:0,
                list:[]
            });
        }
    });
}

function formatPaging({num = 1,size = 10},total){
    return {
        pageNum:num,
        pageSize:size,
        total
    };
}

function turnPage(num,size){
    this.setState({
        data:[]
    });
    let {params} = this;
    wt.extend(params,{
        num,size
    });
    request(params,data => {
        this.setState({
            total:data.total,
            data:data.list
        });
    });
}