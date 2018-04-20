/**
 * Created by Administrator on 2018/3/15.
 */
import React from 'react';
import Component from '../lib/component';

export default class Combobox extends Component{
    constructor(){
        super();
        this.state = {
            selectList:[],
            listShow:false
        }
    }
    componentWillMount(){
        let {data = [],option = {}} = this.props;
        let {selectList} = this.state;
        selectList = wt.clone(selectList);
        let {multiple} = option;
        data.forEach((item,i) => {
            if(item.selected){
                if(multiple){
                    selectList.push(i);
                }else{
                    selectList = [i];
                }
            }
        });
        selectList.noRepeat();
        this.setState({
            selectList,
            data
        });
    }
    render(){
        let {width = '100%',height = '100%',panelWidth = 'auto',panelHeight = 'auto',textField = 'text',sep = ','} = this.props.option || {};
        let {clickItem,click} = this;
        let {listShow,data,selectList} = this.state;
        return <div onClick={click.bind(this)} className="combo-box" style={{
            width:width.toString().toCssValue(),
            height:height.toString().toCssValue()
        }}>
            <input value={this.getText().join(sep)} disabled readOnly onChange={()=>{}} type="text"/>
            <div className="combo-right-icon">
                <i className="iconfont icon-xiangxiajiantou3" />
            </div>
            <List rect={{
                width:panelWidth,
                height:panelHeight
            }} show={listShow} data={data} select={clickItem.bind(this)} textField={textField} selectList={selectList}/>
        </div>
    }
    click(){
        let {listShow} = this.state;
        this.setState({
            listShow:!listShow
        });
    }
    clickItem(itemIndex,e){
        let {selectList,data} = this.state;
        selectList = wt.clone(selectList);
        let {multiple,onSelect,required = true} = this.props.option || {};
        let index = selectList.indexOf(itemIndex);
        if(index === -1){
            if(multiple){
                selectList.push(itemIndex);
            }else{
                selectList = [itemIndex];
            }
            wt.execFunc(onSelect,data[itemIndex],itemIndex);
        }else{
            if(selectList.length !== 1 || !required){
                selectList.splice(index,1);
            }
        }
        if(multiple){
            e.stopPropagation();
        }
        this.setState({
            selectList
        });
    }
    getData(){
        let {selectList,data} = this.state;
        return selectList.map(item => {
            return data[item];
        });
    }
    getText(){
        let {textField = 'text'} = this.props;
        return this.getData().map(item => item[textField]);
    }
    getValue(){
        let {valueField = 'value'} = this.props;
        return this.getData().map(item => item[valueField]);
    }
}


const List = props => {
    let {rect,show,data,textField = 'text',select,selectList} = props;
    let {width,height} = rect;
    return <div className={`combo-content ${show ? '' : 'hide'}`}>
        <ul className="combo-list" style={{
            width:width.toString().toCssValue(),
            height:height.toString().toCssValue(),
            marginRight:width === 'auto' ? '-2px' : 0
        }}>
            {
                data.map((item,i) => {
                    return <li className={selectList.indexOf(i) !== -1 ? 'active' : ''} onClick={select.bind(null,i)} key={i}>{item[textField]}</li>
                })
            }
        </ul>
    </div>
};