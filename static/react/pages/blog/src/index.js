/**
 * Created by Administrator on 2018/2/7.
 */


import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import store from './store/store';

import Component from './lib/component';
import Header from './view/header';
import Body from './view/body';

class Container extends Component{
    render(){
        return <React.Fragment>
            <Header/>
            <Body />
        </React.Fragment>
    }
}

render(<Provider store={store}>
    <Container />
</Provider>,$('#container')[0]);