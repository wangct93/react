/**
 * Created by Administrator on 2018/3/19.
 */
import React from 'react';


export default ({show,message}) => {
    return <div className="loading-wrap v-mid-box pos-abs fit text-center" style={{
        display:show ? 'block' : 'none'
    }}>
        <div className="process-text">{message || '数据加载中......'}</div>
    </div>
}