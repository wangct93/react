/**
 * Created by Administrator on 2018/2/25.
 */

import React,{Component} from 'react';
import {reactComponent} from '../reactComponent';
import {dispatch} from '../store';

export class PersonPanel extends reactComponent{
    render(){
        var data = this.props.data;
        return <List list={data.list} childComponent={PersonItem} panelIndex={data.index}/>
    }
}

class PersonItem extends reactComponent{
    render(){
        var data = this.props.data;
        return <div className="person-item">
            {
                data.name
            }
        </div>
    }
}


class List extends reactComponent{
    render(){
        var component = this.props.childComponent;
        return <ul className="classify-list">
            {
                this.props.list.map((item,i) => {
                    return <li key={i} className={item.selected ? 'active' : ''} onClick={this.click.bind(this,i,this.props.panelIndex)}>
                        <div className="classify-header">
                            <i className="iconfont icon-sanjiao"></i>
                            {item.name}
                        </div>
                        <ul className="classify-sub-list" onClick={(e)=>{e.stopPropagation()}}>
                            {
                                item.list.map((subItem,i) => {
                                    return <li key={i}>
                                        {
                                            component && React.createElement(component,{
                                                data:subItem
                                            })
                                        }
                                    </li>
                                })
                            }
                        </ul>
                    </li>
                })
            }
        </ul>
    }
    click(index,panelIndex){
        dispatch({
            type:'userListExpand',
            panelIndex:panelIndex,
            index:index
        });
    }
}

export class QunPanel extends reactComponent{
    render(){
        return <div className="user-panel">
            qqq
        </div>
    }
}