/**
 * Created by Administrator on 2018/3/7.
 */



export let requestData = (params) => {
    return {
        type:'requestStoryData',
        params
    }
};

export let turnPage = (num,size) => {
    return {
        type:'storyTurnPage',
        num,
        size
    }
};
export let search = (keyword) => {
    return {
        type:'searchStory',
        keyword
    }
};
export let changeSort = (data) => {
    return {
        type:'changeStorySort',
        data
    }
};
