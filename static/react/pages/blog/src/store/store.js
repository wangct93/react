/**
 * Created by Administrator on 2018/3/7.
 */
import {createStore,combineReducers} from 'redux';

import * as dialog from './dialog/reducer';
import * as blog from './blog/reducer';
let fn = combineReducers(wt.extend({},blog));
export let store = createStore((state,action) => {
    console.log('store接收操作：' + action.type);
    return fn(state,action);
});
window.store = store;
export default store;

export const dispatch = (action) =>{
    store.dispatch(action);
};
