/**
 * Created by Administrator on 2018/3/8.
 */
import React from 'react';
import Component from '../lib/component';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';

export default class Table extends Component{
    constructor(){
        super();
        this.state = {
            selectList:[]
        }
    }
    render(){
        let opt = this.props.option;
        let columns = opt.columns;
        let hasFitColumns = columns.some((column) => {
            return !column.fixed
        });
        if(!hasFitColumns){
            columns = columns.slice(0);
            columns.push({});
        }
        let data = this.props.data || [];
        return <table className={`info-table list-table ${opt.iconCls || ''}`}>
            <thead>
            <tr className="info-table-header">
                {
                    columns.map((column,i) => {
                        return <td width={column.fixed ? column.width : 'auto'} key={i} align={column.hAlign || 'center'}>{column.title}</td>
                    })
                }
            </tr>
            </thead>
            <tbody>
            {
                data.map((item,dataIndex) => {
                    return <tr key={dataIndex} className={this.state.selectList.indexOf(dataIndex) !== -1 ? 'active' : ''} onClick={this.rowClick.bind(this,dataIndex)}>
                        {
                            opt.columns.map((column,i) => {
                                let value = item[column.field];
                                return <td key={i} align={column.align || 'center'}>
                                    {
                                        column.elemList ? column.elemList.map((btn,i) => {
                                            return React.createElement(btn.component || 'a', {
                                                className:btn.iconCls,
                                                onClick:btn.handler.bind(this,item,i),
                                                key:i
                                            }, btn.text)
                                        }) : column.formatter ? column.formatter(value,dataIndex,item) : value
                                    }
                                </td>
                            })
                        }
                    </tr>
                })
            }
            </tbody>
        </table>
    }
    rowClick(trIndex){
        if(this.props.option.selected){
            let list = this.state.selectList.slice(0);
            let index = list.indexOf(trIndex);
            if(index === -1){
                list.push(trIndex);
            }else{
                list.splice(index,1);
            }
            this.setState({
                selectList:list
            });
        }
    }
    getSelected(){
        return this.props.data.filter((item,i) => {
            return this.state.selectList.indexOf(i) !== -1;
        });
    }
}