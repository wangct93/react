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
            width:300,
            height:140,
            title:'提示',
            buttons:[
                {
                    iconCls:'icon-duihao',
                    text:'确定',
                    handler:(dialog) => {
                        dialog.close();
                    }
                }
            ],
            content:Info
        }
    }
    render(){
        return <Dialog dialogId={this.props.dialogId} option={this.getOption()}/>
    }
    getOption(){
        return wt.extend({},this.state,this.props.option);
    }
}

class Info extends Component{
    render(){
        return <div className="prompt-alert-box">
            {this.props.data.message}
        </div>;
    }
}