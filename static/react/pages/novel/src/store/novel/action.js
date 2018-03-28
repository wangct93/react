/**
 * Created by Administrator on 2018/3/7.
 */



export let changeNav = (index) => {
    return {
        type:'changeNav',
        index
    }
};

export let requestInfo = () => {
    return {
        type:'requestInfo'
    }
};
export let requestChapterList = () => {
    return {
        type:'requestChapterList'
    }
};
