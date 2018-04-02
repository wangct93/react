/**
 * Created by Administrator on 2018/1/27.
 */
import React from 'react';

class reactComponent extends React.Component{
    shouldComponentUpdate(nProps,nState){
        return !wt.equal(this.state,nState) || !wt.equal(this.props,nProps);
    }
}
export {reactComponent};