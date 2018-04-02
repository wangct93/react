/**
 * Created by Administrator on 2018/3/9.
 */
import React from 'react';
import Component from '../lib/component';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import * as actions from '../store/dialog/action';

import Btn from './btn';

class Dialog extends Component{
    constructor(){
        super();
        this.state = {
            title:'提示',
            width:600,
            height:400,
            tools:[
                {
                    iconCls:'icon-cha2',
                    handler:this.close
                }
            ],
            buttons:[]
        }
    }
    render(){
        let data = this.getConfig();
        let {mouseData,rect} = this;
        return <div className="mask-container" onMouseMove={this.mousemove.bind(this)} onMouseUp={this.mouseup.bind(this)}>
            {
                mouseData && mouseData.state === 'down' && <VirFrame width={rect.width} height={rect.height} left={mouseData && mouseData.left} top={mouseData && mouseData.top} />
            }
            <div className="prompt-box" style={{
                width:rect.width + 'px',
                height:rect.height + 'px',
                left:rect.left + 'px',
                top:rect.top + 'px'
            }}>
                <div className="prompt-header" onMouseDown={this.mousedown.bind(this)}>
                    <span>{data.title}</span>
                    <div className="prompt-toolbox">
                        {
                            data.tools.map((item,i) => {
                                return <i key={i} onClick={item.handler.bind(this)} className={`prompt-tool iconfont ${item.iconCls || ''}`}></i>
                            })
                        }
                    </div>
                </div>
                <div className="prompt-body fit">{React.createElement(data.content,{
                    ref:'content',
                    data:data.data
                })}</div>
                <div className="prompt-btnbox">
                    {
                        data.buttons.map((item,i) => {
                            return <Btn text={item.text} iconCls={item.iconCls} key={i} click={item.handler.bind(null,this)}/>
                        })
                    }
                </div>
            </div>
            <div className="mask-shadow">

            </div>
        </div>
    }
    getConfig(){
        let data = wt.extend({},this.state,this.props.option);
        this.rect = {
            width:data.width,
            height:data.height,
            left:this.state.left == null ? (window.innerWidth - data.width) / 2 : this.state.left,
            top:this.state.top == null ? (window.innerHeight - data.height) / 2 : this.state.top
        };
        return data;
    }
    close(){
        this.props.close(this.props.dialogId);
    }
    mousedown(e){
        if(e.button !== 2){
            this.mouseData = {
                state:'down',
                dx:e.clientX - this.rect.left,
                dy:e.clientY - this.rect.top
            }
        }
    }
    mousemove(e){
        let {mouseData} = this;
        if(mouseData && mouseData.state === 'down'){
            wt.extend(mouseData,{
                left:e.clientX - mouseData.dx,
                top:e.clientY - mouseData.dy
            });
            this.setState({
                date:+new Date()
            });
        }
    }
    mouseup(){
        let {mouseData} = this;
        if(mouseData && mouseData.state === 'down'){
            this.mouseData = {
                state:'up'
            };
            let {left,top} = mouseData;
            if(left != null){
                this.setState({
                    left,
                    top,
                    date:+new Date()
                });
            }
        }
    }
}


class VirFrame extends Component{
    render(){
        let {width,height,left,top} = this.props;
        return <div className="vir-frame" style={{
            width:width + 'px',
            height:height + 'px',
            left:left + 'px',
            top:top + 'px'
        }}></div>
    }
}

export default connect((state) => ({}),actions)(Dialog);


