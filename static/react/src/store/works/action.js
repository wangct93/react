/**
 * Created by Administrator on 2018/3/7.
 */



export let requestData = (params) => {
    return {
        type:'requestWorksData',
        params
    }
};

export let turnPage = (num,size) => {
    return {
        type:'worksTurnPage',
        num,
        size
    }
};
export let search = (keyword) => {
    return {
        type:'searchWorks',
        keyword
    }
};
export let changeSort = (data) => {
    return {
        type:'changeWorksSort',
        data
    }
};
