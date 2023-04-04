<template>
    <ul class="layout-tree-menu">
        <li v-for="(item,idx) in data" :key="idx">
            <template v-if="item.children && item.children.length > 0">
                <div @click="toggle(item)">
                    {{ item.meta.label }}
                    <SvgChevronDown v-if="toggleData[item.meta.id]" />
                    <SvgChevronUp v-else/>
                </div>
                <TreeMenu :data="item.children" :relativePath="toRootPath(item)" :toggleIdList="toggleIdList" v-show="toggleData[item.meta.id]" />
            </template>
            <template v-else>
                <router-link :to="toRootPath(item)" class="tree-one-item" :class="{ active: $route.path === toRootPath(item) }">
                    {{ item.meta.label }}<span v-if="name=='sale'" v-html="getTotal(item)"></span>
                </router-link>
            </template>
        </li>
    </ul>
</template>
<script setup>
import { computed, reactive, watch } from 'vue';
import { useStore } from 'vuex'
import SvgChevronDown from '../svgs/chevron-down.svg?component';
import SvgChevronUp from '../svgs/chevron-up.svg?component';
const props = defineProps({
    data: Array,
    name: {
        type: String,
        default: '',
    },
    // 初始化时需要展开的id
    toggleIdList: {
        type: Array,
        default: [],
    },
    relativePath: {
        type: String,
        default: '',
    },
});
const store = useStore();
const toggleData = reactive({});
function toggle(item) {
    toggleData[item.meta.id] = !toggleData[item.meta.id];
}
function toRootPath(item) {
    return props.relativePath ? `${props.relativePath}/${item.path}` : item.path;
}
function getTotal(item) {
    let id = item.value.meta.id
    // 限制，依赖id的设置，与路由的ID要一直，都是前端维护的字段
    let key = `id${id}`;
    let total = store.getters['total'];
    if (!total || total[key] === undefined) return '';
    return `(${total[key]})`;
}
watch(()=>props.toggleIdList, ()=>{
    props.toggleIdList.forEach(id=>{
        toggleData[id] = true;
    })
})
</script>