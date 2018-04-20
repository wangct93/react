/**
 * Created by wangct on 2018/3/31.
 */
import React from 'react';
import Component from '../lib/component';

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
                    data.map(({src,href},i) => {
                        let left = i === curIndex ? curLeft || 0 : i === oldIndex ? oldLeft || 0 : 0;
                        return <li key={i} style={{
                            display:i === curIndex || i === oldIndex ? 'block' : 'none',
                            left:left + 'px'
                        }}>
                            <a target="_blank" href={href}>
                                <img src={src}/>
                            </a>
                        </li>
                    })
                }
            </ul>
            <ul className="lbt-control" ref="controlBox">
                {
                    data.map(({selected},i) => {
                        return <li onClick={this.controlClick.bind(this,i)} key={i} className={i === curIndex ? 'active' : ''}><canvas width="16" height="16"/></li>;
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
        this.deg = 360;
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
        let {interval = 3000} = this.props;
        this.deg = 0;
        this.moveEnd = true;
        let diffDeg = 360 / +interval * 30;
        this.moveTimer = setInterval(() => {
            this.deg += diffDeg;
            if(this.deg > 360){
                this.deg = 0;
                let {curIndex} = this.state;
                let {data} = this.props;
                let index = curIndex === data.length - 1 ? 0 : curIndex + 1;
                this.move(index,'right');
            }else if(this.moveEnd){
                this.drawCanvas();
            }
        },30);
        this.drawCanvas();
        this.paused = false;
    }
    drawCanvas(){
        let box = this.refs.controlBox;
        if(box){
            wt.$(box).children().forEach((item,i) => {
                let canvas = $(item).find('canvas')[0];
                let c = canvas.getContext('2d');
                c.clearRect(0,0,canvas.width,canvas.height);
                c.beginPath();
                c.arc(7,7,6,0,2 * Math.PI,true);
                c.strokeStyle = '#ccc';
                c.lineWidth = 2;
                c.stroke();
                if(i === this.state.curIndex){
                    c.beginPath();
                    let dfd = this.deg / 360 * 2;
                    let ofd = 3 / 2;
                    c.arc(7,7,6,ofd * Math.PI,(ofd + dfd) * Math.PI,false);
                    c.strokeStyle = '#00a4ff';
                    c.stroke();
                }
            });
        }
    }
    pause(){
        this.paused = true;
        clearInterval(this.moveTimer);
    }
    action(){
        let {actionTime = 300} = this.props;
        let {width} = this;
        let spd = width / actionTime * 30;
        this.moveEnd = false;
        let actionTimer = setInterval(() => {
            let {direction,curLeft,oldLeft} = this.state;
            let dLeft = (direction === 'right' ? -1 : 1) * spd;
            let isMoving = true;
            curLeft += dLeft;
            oldLeft += dLeft;
            if(dLeft > 0 && curLeft > 0 || dLeft < 0 && curLeft < 0){
                isMoving = false;
                curLeft = 0;
                oldLeft = -9999;
                clearInterval(actionTimer);
                this.moveEnd = true;
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
    refresh(){
        this.setState({
            _date:+new Date()
        });
    }
    componentDidMount(){
        this.width = this.refs.box.offsetWidth;
        this.start();
    }
    componentDidUpdate(){
        this.drawCanvas();
    }
}

