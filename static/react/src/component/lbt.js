/**
 * Created by wangct on 2018/3/31.
 */
import React from 'react';
import Component from '../lib/component';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';

export default class Lbt extends Component{
    constructor(){
        super();
        this.state = {
            curIndex:0
        }
    }
    render(){
        let {data} = this.props;
        let {curIndex,oldIndex,curLeft,oldLeft} = this.state;
        return <div className="lbt-box" ref="box" onMouseLeave={this.mouseLeave.bind(this)}>
            <ul className="lbt-list">
                {
                    data.map(({src},i) => {
                        let left = i === curIndex ? curLeft || 0 : i === oldIndex ? oldLeft || 0 : 0;
                        return <li key={i} style={{
                            display:i === curIndex || i === oldIndex ? 'block' : 'none',
                            left:left + 'px'
                        }}>
                            <img src={src}/>
                        </li>
                    })
                }
            </ul>
            <ul className="lbt-control">
                {
                    data.map(({selected},i) => {
                        return <li onClick={this.controlClick.bind(this,i)} key={i} className={i === curIndex ? 'active' : ''}></li>;
                    })
                }
            </ul>
        </div>
    }
    controlClick(index){
        let {curIndex:oldIndex,isMoving} = this.state;
        if(index === oldIndex || isMoving){
            return;
        }
        this.pause();
        this.move(index);
    }
    move(index,direction){
        let {curIndex:oldIndex,isMoving} = this.state;
        let {width} = this;
        if(!direction){
            direction = index > oldIndex ? 'right' : 'left';
        }
        let curLeft = direction === 'right' ? width : -width;
        this.setState({
            curIndex:index,
            oldIndex,
            curLeft,
            oldLeft:0,
            isMoving:true,
            direction
        });
        this.action();
    }
    start(){
        clearInterval(this.moveTimer);
        this.moveTimer = setInterval(() => {
            let {curIndex} = this.state;
            let {data} = this.props;
            let index = curIndex === data.length - 1 ? 0 : curIndex + 1;
            this.move(index,'right');
        },3000);
        this.paused = false;
    }
    pause(){
        this.paused = true;
        clearInterval(this.moveTimer);
    }
    action(){
        let actionTimer = setInterval(() => {
            let {direction,curLeft,oldLeft} = this.state;
            let dLeft = (direction === 'right' ? -1 : 1) * 30;
            let isMoving = true;
            curLeft += dLeft;
            oldLeft += dLeft;
            if(dLeft > 0 && curLeft > 0 || dLeft < 0 && curLeft < 0){
                isMoving = false;
                curLeft = 0;
                oldLeft = -9999;
                clearInterval(actionTimer);
            }
            this.setState({
                curLeft,
                oldLeft,
                isMoving
            });
        },30)
    }
    mouseLeave(){
        if(this.paused){
            this.start();
        }
    }
    componentDidMount(){
        this.width = this.refs.box.offsetWidth;
        this.start();
    }
}

