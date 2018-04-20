/**
 * Created by Administrator on 2018/3/15.
 */
import React from 'react';
import Component from '../lib/component';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';

export default class Combobox extends Component{
    constructor(){
        super();
        this.state = {
            selectList:[],
            data:[],
            listShow:false
        }
    }
    componentWillMount(){
        this.option = wt.extend(true,this.state,this.props);
        let {selectList,data} = this.option;
        data.forEach((item,i) => {
            item.selected && selectList.push(i);
        });
    }
    render(){
        let {data,selectList,width,height,panelWidth,panelHeight,listShow,textField = 'text'} = this.option;
        let valueList = [];
        data.forEach((item,i) => {
            selectList.indexOf(i) !== -1 && valueList.push(item[textField]);
        });
        return <div onClick={this.click.bind(this)} className="combo-box" style={{
            width:width == null ? '100%' : width + 'px',
            height:height == null ? '100%' : height + 'px'
        }}>
            <input value={valueList.join(',')} onChange={()=>{}} type="text" className="combo-input fit"/>
            <div className="combo-right-icon">
                <i className="iconfont icon-duihao"></i>
            </div>
            <div className="combo-content" style={{
                left:'-1px',
                display:listShow ? 'block' : 'none'
            }}>
                <ul className="combo-list" style={{
                    width:panelWidth == null ? 'auto' : panelWidth + 'px',
                    height:panelHeight == null ? 'auto' : panelHeight + 'px',
                    marginRight:panelWidth == null ? '-2px' : 0
                }}>
                    {
                        data.map((item,i) => {
                            return <li className={selectList.indexOf(i) === -1 ? '' : 'active'} onClick={this.clickItem.bind(this,i)} key={i}>{item[textField]}</li>
                        })
                    }
                </ul>
            </div>
        </div>
    }
    click(){
        let {option} = this;
        option.listShow = !option.listShow;
        this.setState({
            date:+new Date()
        });
    }
    clickItem(itemIndex,e){
        let {selectList,multiple,onSelect,data} = this.option;
        if(multiple){
            let index = selectList.indexOf(itemIndex);
            if(index === -1){
                selectList.push(itemIndex);
            }else{
                selectList.splice(index,1);
            }
            e.stopPropagation();
            this.setState({
                date:+new Date()
            });
        }else{
            this.option.selectList = [itemIndex];
        }
        wt.execFunc(onSelect,data[itemIndex]);
    }
    getData(){
        let {option} = this;
        let {selectList,data} = this.option;
        return selectList.map((item,i) => {
            return data[item];
        });
    }
}