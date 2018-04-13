/**
 * Created by Administrator on 2018/3/13.
 */
import React from 'react';

export default props => {
    let {iconCls,children = [],onClick,className = 'w-btn'} = props;
    let iconElem = iconCls && <i key="0" className={`iconfont ${iconCls}`} />;
    return React.createElement('a',{
        onClick,
        className
    },[iconElem,...[].concat(children)]);
}
