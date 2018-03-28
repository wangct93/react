/**
 * Created by Administrator on 2018/3/7.
 */



export let requestData = (params) => {
    return {
        type:'requestBlogData',
        params
    }
};

export let turnPage = (num,size) => {
    return {
        type:'blogTurnPage',
        num,
        size
    }
};
export let search = (keyword) => {
    return {
        type:'searchBlog',
        keyword
    }
};
export let changeSort = (data) => {
    return {
        type:'changeBlogSort',
        data
    }
};
