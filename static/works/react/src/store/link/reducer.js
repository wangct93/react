/**
 * Created by Administrator on 2018/3/7.
 */
let defaultState = {
    classLink:{

    }
};
export let linkData = (state = defaultState,action = {}) => {
    wt.execFunc(reducer[action.type],state,action);
    return state;
};


let reducer = {
    editClass(state,action){
        let {data} = action;
        let {teacherList,studentList,id} = data;
        let target = state.classLink[id];
        if(!target){
            target = {};
            state.classLink[id] = target;
        }
        wt.extend(target,{
            teacherList:teacherList.map((item) => item.id),
            studentList:studentList.map((item) => item.id)
        })
    }
}