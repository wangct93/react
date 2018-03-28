/**
 * Created by Administrator on 2018/3/22.
 */
import React from 'react';
import Component from '../lib/component';


export default class Footer extends Component{
    render(){
        let {year = '2018'} = this.props;
        return <div className="footer-box">
            <div className="center-area">
                <p><span className="copyright">&copy;</span>{year} Wangct,All Rights Reserved.</p>
            </div>
        </div>
    }
}