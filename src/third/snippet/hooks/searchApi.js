import { reactive } from 'vue';

/**
 * 传入数组的API
 * @param {*} getFunList 
 */
export function searchUseApi(getFunList) {
    // 参数
    const searchState = reactive({
        pageSize: 10,
        pageNum: 1,
        tableListFilterList: [], // 过滤
    })
    // 数据
    const table = reactive({
        data: [],
        total: 1,
        size: 10, // 每页的数据量
        index: 0, // 索引list用的
        loading: false, // 加载
        timeout: null, // 防抖动的id
        message: '',
    })

    function debounce(wait) {
        if (table.timeout) clearTimeout(table.timeout);
        table.timeout = setTimeout(() => {
            const getFun = getFunList[table.index]
            getFun(searchState).then((res) => {
                if (res.code === 200) {
                    const data = res.data
                    if (data.list.length > 0) {
                        table.data = data.list
                    } else {
                        table.data = []
                    }
                    if (data.total > 0) {
                        table.total = data.total
                        table.size = data.pageSize
                    } else {
                        table.total = 1
                    }
                    table.loading = false;
                    table.message = '';
                } else {
                    table.loading = false;
                    table.message = res.message;
                    table.data = [];   
                }
            })
        }, wait)
    }
    // getFun, 获取table分页数据的函数
    function tableInit(isFirst) {
        if (isFirst) {
            searchState.pageNum = 1;
        }
        table.loading = true;
        debounce(800);
    }
    function tableFilterReset() {
        searchState.tableListFilterList = []
    }
    const updateFilterValue = (name, value) => {
        for (let key in searchState.tableListFilterList) {
            let tmp = searchState.tableListFilterList[key]
            if (name == tmp.name) tmp.value = value
        }
    }
    const deleteFilter = (name) => {
        let idx = -1
        for (let i = 0; i < searchState.tableListFilterList.length; i++) {
            let tmp = searchState.tableListFilterList[i]
            if (tmp.name == name) {
                idx = i
                break
            }
        }
        if (idx > -1) {
            searchState.tableListFilterList.splice(idx, 1)
        }
    }
    function tableUpdateFilter(type, option) {
        let tmp = searchState.tableListFilterList.filter((e) => e.name == type)
        // 整数型的option.value应该删除
        // 字符串的option.value可以置空
        if (type == 'payStatus' && option.value < 0) {
            deleteFilter(type)
        } else {
            if (tmp.length > 0) {
                // 存在
                updateFilterValue(type, option.value)
            } else {
                // 不存在
                searchState.tableListFilterList.push(option)
            }
        }
    }
    return {
        searchState,
        table,
        tableInit,
        tableFilterReset,
        tableUpdateFilter,
    }
}