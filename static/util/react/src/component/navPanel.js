/**
 * Created by Administrator on 2018/3/7.
 */
import React, {Component} from 'react';

export default class navPanel extends Component{
    render(){
        console.log('渲染执行- -' + this.constructor.name);
        return <React.Fragment>
            {
                this.props.list.map((item,i) => {
                    let component = (item.selected || item.loaded) && item.component || item.componentFunc && item.componentFunc();
                    return <div className={'w-panel ' + (item.selected ? 'active' : '')} key={i}>
                        {
                            component && React.createElement(component,null,{data:item.data || this.props.data})
                        }
                    </div>;
                })
            }
        </React.Fragment>;
    }
}