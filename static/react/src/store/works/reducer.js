/**
 * Created by Administrator on 2018/3/7.
 */
import {dispatch} from '../store';

let defaultState = {
    data:[],
    params:{},
    viewList:[
        {
            iconCls:'icon-liebiao1',
            path:'/table'
        },
        {
            iconCls:'icon-liebiao',
            path:'/list'
        }
    ],
    sortList:[
        {
            field:'time',
            text:'上传时间',
            selected:true
        }
    ]
};

export let worksData = (state = defaultState,action = {}) => {
    state = wt.clone(state);
    wt.execFunc(reducer[action.type],state,action);
    return state;
};

let reducer = {
    requestWorksDataEnd(state,action){
        state.isLoading = false;
        let {total,list} = action.data;
        state.data = list;
        state.total = total;
    },
    worksTurnPage(state,action){
        requestData(state,{
            num:action.num,
            size:action.size
        });
    },
    searchWorks(state,action){
        requestData(state,{
            keyword:action.keyword,
            num:1
        });
    },
    changeWorksSort(state,{data}){
        requestData(state,{
            sortField:data.field,
            sortDesc:true
        });
    }
};

const requestData = (state,newParams) => {
    let {params} = state;
    if(!params.sortField){
        let {field} = state.sortList.filter(item => item.selected)[0];
        wt.extend(params,{
            sortField:field,
            sortDesc:true
        })
    }
    requestDataByParams(wt.extend(params,newParams));
    state.isLoading = true;
};
const requestDataByParams = (params) => {
    $.ajax({
        url:'/getWorksList',
        data:params,
        success:(data) => {
            dispatch({
                type:'requestWorksDataEnd',
                data:data
            });
        }
    });
};