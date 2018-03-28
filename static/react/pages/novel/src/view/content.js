/**
 * Created by Administrator on 2018/3/22.
 */
import React from 'react';
import Component from '../lib/component';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import Panel from '../../../../src/component/navPanel';

import * as actionObj from '../store/novel/action';



class Content extends Component{
    render(){
        let {list} = this.props;
        return <div className="content">
            <Nav list={list} click={this.props.changeNav}/>
            <NavPanel list={list}/>
        </div>
    }
}


class Nav extends Component{
    render(){
        return <ul className="nav-list">
            {
                this.props.list.map((item,i) => {
                    let {selected,title} = item;
                    return <li onClick={this.props.click.bind(this,i)} className={selected ? 'active' : ''} key={i}>{title}</li>
                })
            }
        </ul>
    }
}

class NavPanel extends Component{
    render(){
        return <div>
            <Panel list={this.props.list} />
        </div>
    }
}

export default connect((state) => ({
    list:state.novelData.nav
}),actionObj)(Content);