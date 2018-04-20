/**
 * Created by Administrator on 2018/3/7.
 */
import {createStore,combineReducers} from 'redux';

import * as header from './header/reducer';
import * as nav from './nav/reducer';
import * as classView from './classView/reducer';
import * as student from './student/reducer';
import * as teacher from './teacher/reducer';
import * as dialog from './dialog/reducer';
import * as subject from './subject/reducer';
import * as link from './link/reducer';
let fn = combineReducers(wt.extend({},header,nav,classView,teacher,student,dialog,subject,link));
export let store = createStore((state,action) => {
    console.log('store接收操作：' + action.type);
    return fn(state,action);
});
window.store = store;
export default store;

export const dispatch = (action) =>{
    store.dispatch(action);
};
