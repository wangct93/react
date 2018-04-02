/**
 * Created by Administrator on 2018/3/7.
 */
import React from 'react';
import Component from './lib/component';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import store from './store/store';

import Header from './view/header';
import Body from './view/body';

import DialogList from './view/dialogList';

class Container extends Component{
    render(){
        return <React.Fragment>
            <Header/>
            <Body/>
            <DialogList/>
        </React.Fragment>
    }
}

render(<Provider store={store}>
    <Container/>
</Provider>,$('#container')[0]);