/**
 * Created by Administrator on 2018/3/12.
 */
import React from 'react';
import Component from '../lib/component';
import Dialog from './dialog';



export default class Alter extends Component{
    constructor(){
        super();
        this.state = {
            width:350,
            height:200,
            title:'提示',
            buttons:[
                {
                    iconCls:'icon-duihao',
                    text:'确定',
                    handler:(dialog) => {
                        dialog.close();
                    }
                }
            ]
        }
    }
    render(){
        return <Dialog option={this.getOption()}/>
    }
    getOption(){
        let {option,children} = this.props;
        return wt.extend({},this.state,option,{
            content:<Content>{children}</Content>
        });
    }
}

const Content = ({children}) => {
    return <div className="alert-text">
        {children}
    </div>;
};