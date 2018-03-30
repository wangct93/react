import React from 'react';
import Component from '../lib/component';

export default class Paging extends Component{
    constructor(){
        super();
        this.state = {
            pageNum:1,
            pageSize:10,
            total:100,
            showLength:10,
            alignText:'right'
        };
    }
    render(){
        let data = this.filterData();
        let {pageNum,maxPageNum,alignText,pageList} = data;
        return <div className={'paging-box paging-box-' + alignText}>
            <span className={'paging-btn paging-btn-prev ' + (pageNum === 1 ? 'paging-diasbaled' : '')} onClick={this.select.bind(this,pageNum - 1)}>上一页</span>
            <div className="paging-pagebox">
                {
                    pageList.map((num,i) => {
                        return <span key={i} onClick={this.select.bind(this,num)} className={'paging-item ' + (num === pageNum ? 'active' : '')}>{num}</span>
                    })
                }
            </div>
            <span className={'paging-btn paging-btn-next ' + (pageNum === maxPageNum ? 'paging-diasbaled' : '')} onClick={this.select.bind(this,pageNum + 1)}>下一页</span>
            <input className="paging-input" onKeyUp={this.inputKeyUp.bind(this)} onKeyDown={this.inputKeyDown.bind(this)} type="text"/>
            <span className="paging-message">共{maxPageNum}页</span>
        </div>;
    }
    select(pageNum){
        let opt = this.option;
        if(pageNum > 0 && pageNum <= opt.maxPageNum){
            wt.execFunc.call(this,this.props.onSelect,pageNum,opt.pageSize);
        }
    }
    inputKeyDown(e){
        let filterCodes = [8,37,39];
        let keyCode = e.keyCode;
        if(keyCode >= 96 && keyCode <= 105 || keyCode >= 48 && keyCode <= 57){
            keyCode = keyCode > 57 ? keyCode - 48 : keyCode;
            let input = e.target;
            let max = this.option.maxPageNum;
            let num = (input.value + String.fromCharCode(keyCode)).toNum();
            if(num > max){
                num = max;
                input.value = num;
                e.preventDefault();
            }
        }else if(filterCodes.indexOf(keyCode) === -1){
            e.preventDefault();
        }
    }
    inputKeyUp(e){
        if(e.keyCode === 13){
            let input = e.target;
            let num = input.value.toNum();
            this.select(num);
        }
    }
    filterData(){
        let data = wt.extend({},this.state,this.props,this.props.option);
        let {pageNum,pageSize,showLength,total} = data;
        let maxPageNum = Math.ceil(total / pageSize) || 1;
        let itemLength = Math.min(showLength,maxPageNum);
        let halfLen = Math.floor(itemLength / 2);
        let dNum = pageNum - halfLen;
        if(pageNum <= halfLen + 1){
            dNum = 1;
        }else if(pageNum > maxPageNum - halfLen){
            dNum = maxPageNum - itemLength + 1;
        }
        let pageList = [];
        for(let i = 0;i < itemLength;i++){
            pageList.push(i + dNum);
        }
        this.option = wt.extend(data,{
            maxPageNum,
            pageList
        });
        return data;
    }
}

