/**
 * Created by Administrator on 2018/3/8.
 */
import React from 'react';
import Component from '../lib/component';

export default class Table extends Component{
    render(){
        let {option,data = [],className = ''} = this.props;
        let {columns} = option;
        let hasFitColumns = columns.some((column) => {
            return column.fit;
        });
        if(!hasFitColumns){
            columns = columns.slice(0);
            columns.push({fit:true});
        }
        let {selectList = []} = this.state || {};
        return <div className="list-table-wrap">
            <div className="list-table-head">
                <table className={`list-table ${className}`}>
                    <thead>
                    <tr className="list-table-tr">
                        {
                            columns.map((column,i) => {
                                let {fit,width,hAlign,align,title} = column;
                                return <td className="list-table-td" width={fit ? 'auto' : width} key={i} align={hAlign || align || 'center'}>{title}</td>
                            })
                        }
                    </tr>
                    </thead>
                </table>
            </div>
            <div className="list-table-body">
                <table className={`list-table ${className}`}>
                    <tbody>
                    {
                        data.map((item,dataIndex) => {
                            let selected = selectList.indexOf(dataIndex) !== -1 ? 'active' : '';
                            return <tr key={dataIndex} className={`list-table-tr ${selected}`} onClick={this.rowClick.bind(this,dataIndex)}>
                                {
                                    columns.map((column,i) => {
                                        let {field,elemList,align = 'center',formatter,fit,width} = column;
                                        let value = item[field];
                                        return <td className="list-table-td" key={i} align={align} width={fit ? 'auto' : width}>
                                            {
                                                elemList ? elemList.map((btn,i) => {
                                                    let {component = 'a',iconCls,handler,text} = btn;
                                                    return React.createElement(component, {
                                                        className:iconCls,
                                                        onClick:handler.bind(this,item,i),
                                                        key:i
                                                    }, text)
                                                }) : formatter ? formatter(value,dataIndex,item) : value
                                            }
                                        </td>
                                    })
                                }
                            </tr>
                        })
                    }
                    </tbody>
                </table>
            </div>
        </div>
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