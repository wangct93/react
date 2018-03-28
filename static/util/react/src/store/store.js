/**
 * Created by Administrator on 2018/3/7.
 */
import {createStore,combineReducers} from 'redux';
import * as demo from './demo/reducer';
let fn = combineReducers(wt.extend({},demo));
export let store = createStore((state,action) => {
    console.log('store接收操作：' + action.type);
    return fn(state,action);
});
export default store;
