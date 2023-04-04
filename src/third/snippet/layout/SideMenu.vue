<template>
    <li class="layout-menu">
        <template v-if="node.children">
            <li @click="toggle">
                {{ node.meta.label }}
                <SvgChevronDown v-if="toggleData[node.meta.id]" />
                <SvgChevronUp v-else/>
            </li>
            <SideMenu
                :name="name"
                v-show="toggleData[node.meta.id]"
                v-for="child in node.children"
                :key="child.meta.name"
                :node="child"
                :base-path="resolvePath(child.path)"
            />
        </template>
        <template v-else>
            <router-link :to="basePath" class="layout-menu-item" :class="{ active: $route.path === basePath }">
                {{ node.meta.label }}<span v-if="name=='sale'" v-html="getTotal()"></span>
            </router-link>
        </template>
    </li>
</template>
<script setup>
import { computed, reactive, watch } from 'vue';
import { useStore } from 'vuex'
import SvgChevronDown from '../svgs/chevron-down.svg?component';
import SvgChevronUp from '../svgs/chevron-up.svg?component';
const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    node: {
        type: Object,
        required: true,
    },
    basePath: {
        type: String,
        default: '',
    },
    // 初始化时需要展开的id
    createToggleId: {
        type: Number,
        default: 0,
    },
});
const store = useStore();
const node = computed(() => props.node)
const basePath = computed(() => props.basePath)
const createToggleId = computed(() => props.createToggleId)
const toggleData = reactive({})
function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}
function resolvePath(routePath) {
    if (isExternal(routePath)) return routePath
    let path = `${basePath.value}/${routePath}`;
    return path;
}
function toggle() {
  toggleData[node.value.meta.id] = !toggleData[node.value.meta.id];
}
function getTotal() {
    let id = node.value.meta.id
    // 限制，依赖id的设置，与路由的ID要一直，都是前端维护的字段
    let key = `id${id}`;
    let total = store.getters['total'];
    if (!total || total[key] === undefined) return '';
    return `(${total[key]})`;
}
toggleData[createToggleId.value] = true;
</script>