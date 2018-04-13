/**
 * Created by Administrator on 2018/3/9.
 */
import React from 'react';
import Component from '../lib/component';

import Btn from './btn';


export default class Dialog extends Component{
    constructor(){
        super();
        this.state = {
            _height:600,
            _width:800
        }
    }
    componentWillMount(){
        let {_width,_height,_top,_left} = this.state;
        let {width = _width,height = _height,left,top} = this.props.option || {};
        let mWidth = window.innerWidth;
        let mHeight = window.innerHeight;
        this.setState({
            width,
            height,
            left:_left || left || (window.innerWidth - width) / 2,
            top:_top || top || (window.innerHeight - height) / 2
        });
    }
    render(){
        let {props,mousemove,mouseup,mouseData = {}} = this;
        let {option} = props;
        let rect = this.getRect();
        let {width,height} = rect;
        let {top,left} = mouseData;
        let {hide} = this.state;
        return <div style={{
            display:hide ? 'none' : 'block'
        }} className="dialog-container" onMouseMove={mousemove.bind(this)} onMouseUp={mouseup.bind(this)}>
            {
                mouseData.state === 'move' && <DragRect rect={{
                    width,
                    height,
                    left,
                    top
                }}/>
            }
            <Content rect={rect} option={option} dialog={this} />
            <Shadow />
        </div>
    }
    getRect(){
        let {width,height,top,left} = this.state;
        return {
            width,height,top,left
        };
    }
    close(){
        this.setState({
            hide:true
        });
    }
    mousedown(e){
        if(e.button !== 2){
            let {left,top} = this.state;
            this.mouseData = {
                state:'move',
                dx:e.clientX - left,
                dy:e.clientY - top
            }
        }
    }
    mousemove(e){
        let {mouseData = {}} = this;
        if(mouseData.state === 'move'){
            wt.extend(mouseData,{
                left:e.clientX - mouseData.dx,
                top:e.clientY - mouseData.dy
            });
            this.refresh();
        }
    }
    mouseup(){
        let {mouseData = {}} = this;
        if(mouseData.state === 'move'){
            let {left,top} = mouseData;
            this.mouseData = undefined;
            if(left !== undefined){
                this.setState({
                    left,
                    top
                });
            }
        }
    }
    refresh(){
        this.setState({
            _date:+new Date()
        });
    }
}

const Content = props => {
    let {dialog,rect = {},option} = props;
    let {width,height,left,top} = rect;
    let {title = 'new title',content,buttons = [],tools = [{
        iconCls:'icon-cha2',
        handler:(dialog) => {
            dialog.close();
        }
    }]} = option;

    return <div className="dialog-box" style={{
        width:width + 'px',
        height:height + 'px',
        left:left + 'px',
        top:top + 'px'
    }}>
        <div className="dialog-header" onMouseDown={dialog.mousedown.bind(dialog)}>
            <span>{title}</span>
            {
                tools.length ? <div className="dialog-tool-box">
                    {
                        tools.map(({handler,iconCls},i) => {
                            return <i key={i} onClick={handler.bind(null,dialog)} className={`iconfont ${iconCls}`}/>
                        })
                    }
                </div> : ''
            }
        </div>
        <div className="dialog-body">{content}</div>
        {
            buttons.length ? <div className="dialog-btn-box">
                {
                    buttons.map((item,i) => {
                        let {text,iconCls,handler} = item;
                        return <Btn iconCls={iconCls} key={i} onClick={handler.bind(item,dialog)}>{text}</Btn>
                    })
                }
            </div> : ''
        }
    </div>;
}


const Shadow = props => {
    return <div className="shadow-bg"></div>
}


const DragRect = props => {
    let {width,height,left,top} = props.rect || {};
    return <div className="drag-dialog-rect" style={{
        width:width + 'px',
        height:height + 'px',
        left:left + 'px',
        top:top + 'px'
    }}></div>
}
