import React,{Component} from 'react';

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
        console.log('渲染执行- -' + this.constructor.name);
        var data = wt.extend({},this.state,this.props);
        this.setOption(data);
        var pageNum = data.pageNum;
        return <div className={'paging-box paging-box-' + data.alignText}>
            <span className={'paging-btn paging-btn-prev ' + (pageNum == 1 ? 'paging-diasbaled' : '')} onClick={this.select.bind(this,pageNum - 1)}>上一页</span>
            <div className="paging-pagebox">
                {
                    data.pageList.map((num,i) => {
                        return <span key={i} onClick={this.select.bind(this,num)} className={'paging-item ' + (num == pageNum ? 'active' : '')}>{num}</span>
                    })
                }
            </div>
            <span className={'paging-btn paging-btn-next ' + (pageNum == data.maxPageNum ? 'paging-diasbaled' : '')} onClick={this.select.bind(this,pageNum + 1)}>下一页</span>
            <input className="paging-input" onKeyUp={this.inputKeyUp.bind(this)} onKeyDown={this.inputKeyDown.bind(this)} type="text"/>
            <span className="paging-message">共{data.maxPageNum}页</span>
        </div>;
    }
    select(pageNum){
        var opt = this.option;
        if(pageNum > 0 && pageNum <= opt.maxPageNum){
            wt.execFunc.call(this,this.props.onSelect,pageNum,opt.pageSize);
        }
    }
    inputKeyDown(e){
        var filterCodes = [8,37,39];
        var keyCode = e.keyCode;
        if(filterCodes.indexOf(keyCode) == -1 && !(keyCode >= 48 && keyCode <= 57 || keyCode >= 96 && keyCode <= 105)){
            e.preventDefault();
        }
    }
    inputKeyUp(e){
        var input = e.target;
        var num = input.value.toNum();
        var max = this.option.maxPageNum;
        if(num > max){
            num = max;
            input.value = num;
        }
        if(e.keyCode == 13){
            this.select(num);
        }
    }
    setOption(data){
        var pageNum = data.pageNum;
        var maxPageNum = Math.ceil(data.total / data.pageSize) || 1;
        var itemLength = Math.min(data.showLength,maxPageNum);
        var halfLen = Math.floor(itemLength / 2);
        var dNum = pageNum - halfLen;
        if(pageNum <= halfLen + 1){
            dNum = 1;
        }else if(pageNum > maxPageNum - halfLen){
            dNum = maxPageNum - itemLength + 1;
        }
        var pageList = [];
        for(var i = 0;i < itemLength;i++){
            pageList.push(i + dNum);
        }
        this.option = wt.extend(data,{
            maxPageNum,
            pageList
        });
    }
    shouldComponentUpdate(props,state){
        return !wt.equal(this.state,state) || !wt.equal(this.props,props);
    }
}

