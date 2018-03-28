/**
 * Created by Administrator on 2018/3/22.
 */
import React from 'react';
import Component from '../../../../src/lib/component';

import NovelInfo from './novelInfo';
import Content from './content';

export default class Body extends Component{
    render(){
        return <div className="body">
            <div className="center-area">
                <NovelInfo/>
                <Content />
            </div>
        </div>
    }
}
