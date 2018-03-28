/**
 * Created by wangct on 2018/3/10.
 */

import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';
import Dialog from '../component/dialog';

class DialogList extends Component{
    render(){
        return <React.Fragment>
            {
                this.props.list.map((item,i) => {
                    let D = item.component || Dialog;
                    return <D option={item} key={i} dialogId={item.id}/>;
                })
            }
        </React.Fragment>
    }
}

export default connect((state) => state.dialogData)(DialogList);