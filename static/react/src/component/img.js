/**
 * Created by Administrator on 2018/4/4.
 */
import React from 'react';
import Component from '../lib/component';

let imgCache = new wt.LoadImgList({
    imgLoad(img){
        $(img).siblings('.icon-loading').hide();
    }
});


export default class ImgCache extends Component{
    render(){
        return <div className="img-box">
            <i className="icon-loading"></i>
            <img dsrc={this.props.src} ref="img"/>
        </div>
    }
    componentDidMount(){
        imgCache.add(this.refs.img);
        imgCache.load();
    }
}
