/**
 * Created by Administrator on 2018/3/27.
 */
import React from 'react';
import {render} from 'react-dom';
import {NavLink,withRouter} from 'react-router-dom';
import {connect} from 'react-redux';

const Header = ({match,list}) => {
    let basePath = match.url;
    if(basePath === '/'){
        basePath = '';
    }
    return <div className="header">
        <nav className="nav-list flex-box">
            {
                list.map(({path,title},i) => {
                    return <NavLink key={i} to={basePath + path} activeClassName="active">{title}</NavLink>
                })
            }
        </nav>
    </div>
};

export default connect(state => state.navData)(withRouter(Header));