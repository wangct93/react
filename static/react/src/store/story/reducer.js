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
        },
        {
            field:'zanHits',
            text:'推荐数'
        }
    ]
};

export let storyData = (state = defaultState,action = {}) => {
    state = wt.clone(state);
    wt.execFunc(reducer[action.type],state,action);
    return state;
};

let reducer = {
    requestStoryDataEnd(state,action){
        state.isLoading = false;
        let {total,list} = action.data;
        state.data = list;
        state.total = total;
    },
    storyTurnPage(state,action){
        requestData(state,{
            num:action.num,
            size:action.size
        });
    },
    searchStory(state,action){
        requestData(state,{
            keyword:action.keyword,
            num:1
        });
    },
    changeStorySort(state,{index}){
        let {sortList} = state;
        sortList.forEach((item,i) => {
            if(i === index){
                if(item.selected){
                    item.desc = !item.desc;
                    return false;
                }else{
                    item.selected = true;
                }
            }else{
                item.selected = false;
            }
        });
        let sortData = sortList[index];
        requestData(state,{
            sortField:sortData.field,
            sortDesc:sortData.desc || ''
        });
    }
};

const requestData = (state,newParams) => {
    let {params} = state;
    if(!params.sortField){
        let {field,desc} = state.sortList.filter(item => item.selected)[0];
        wt.extend(params,{
            sortField:field,
            sortDesc:desc || ''
        })
    }
    requestDataByParams(wt.extend(params,newParams));
    state.isLoading = true;
};
const requestDataByParams = (params) => {
    $.ajax({
        url:'/getStoryList',
        data:params,
        success:(data) => {
            dispatch({
                type:'requestStoryDataEnd',
                data:data
            });
        }
    });
};