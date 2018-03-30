/**
 * Created by Administrator on 2018/3/22.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';
import Comment from '../../../../src/component/comment';

class CommentPanel extends Component{
    render(){
        let {id} = this.props;
        return <div>
            <Comment targetId={`novel_${id}`} />
        </div>;
    }
}
export default connect((state) => state.novelData)(CommentPanel)