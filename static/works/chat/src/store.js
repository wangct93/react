/**
 * Created by Administrator on 2018/2/25.
 */
import {createStore} from 'redux';
import defaultState from './defaultState';


var loadModuleNames = ['index'];
var midReducers = loadModuleNames.map((item) => {
    return require('./reducer/' + item);
});

var store = createStore((state = defaultState,action) => {
    for(var i = 0;i < midReducers.length;i++){
        let execFunc = midReducers[i];
        let result = execFunc(state,action);
        if(result){
            return wt.extend(true,{},result);
        }
    }
    return state;
});

window.store = store;
export default store;
export function dispatch(){
    store.dispatch(...arguments);
}