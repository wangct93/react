/**
 * Created by Administrator on 2018/2/25.
 */
import React from 'react';
import {render} from 'react-dom';
import store,{dispatch} from './store';
import {reactComponent} from './reactComponent';

class Container extends reactComponent{
    constructor(){
        super();
        this.state = wt.extend(true,{},store.getState());
    }
    render(){
        return <div className="content-box">
            <div className="header">kkdddl</div>
            <div className="content">
                <div className="chat-left">
                    <div className="chat-content" ref="content">
                        <ul className="chat-info-list">
                            {
                                this.state.textList.map((item,i) => {
                                    if(item.type == 'addText'){
                                        return <li key={i} className={item.user.userid == this.state.info.userid ? 'recore-self' : ''}>
                                            <div className="record-header">{item.user.name}({item.user.userid}) {item.time}</div>
                                            <div className="record-content">{item.text}</div>
                                        </li>
                                    }else{
                                        return <li className="chat-alert" key={i}>
                                            {item.user.name} {item.text}
                                        </li>
                                    }
                                })
                            }
                        </ul>
                    </div>
                    <div className="chat-input-box" contentEditable={true} ref="input"></div>
                    <div className="chat-btn-box">
                        <a className="chat-btn" onClick={this.sendText.bind(this)}>发送</a>
                    </div>
                </div>
                <div className="chat-right">
                    <div className="header">在线成员</div>
                    <ul className="person-list">
                        {
                            this.state.userList.map((user,i) => {
                                return <li key={i}>{user.name}</li>
                            })
                        }
                    </ul>
                </div>
            </div>
        </div>
    }
    sendText(){
        var inputDom = this.refs.input;
        var v = inputDom.innerHTML;
        if(!v){
            wt.alert('发送的信息不能为空！');
        }else{
            dispatch({
                type:'sendText',
                text:v
            });
            inputDom.innerHTML = '';
        }
    }
    componentWillMount(){
        store.subscribe((a,b) => {
            var state = store.getState();
            if(!wt.equal(this.state,state)){
                this.setState(wt.extend(true,{},state));
            }
        });
    }
    componentDidMount(){
        dispatch({
            type:'joinRoom'
        });
    }
    componentDidUpdate(){
        var content = this.refs.content;
        content.scrollTop = content.children[0].offsetHeight;
    }
}

render(<Container/>,document.getElementById('container'));
