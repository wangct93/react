/**
 * Created by Administrator on 2018/3/22.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';
import * as actionObj from '../store/novel/action';

class ChapterList extends Component{
    render(){
        let {list = []} = this.props;
        return <ul className="chapter-list">
            {
                list.map((item,i) => {
                    let {name} = item;
                    return <li key={i}><span onClick={this.click.bind(this,item.id)} title={name} className="text-btn">{name}</span></li>;
                })
            }
        </ul>;
    }
    click(id){
        window.open('../chapter/index.html?chapterId=' + id);
    }
}
export default connect((state) => ({
    list:state.novelData.list
}))(ChapterList)