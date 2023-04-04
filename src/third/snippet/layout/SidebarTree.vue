<template>
    <div class="layout-sidebar-tree">
        <TreeMenu :data="menuData" :toggleIdList="toggleIdList" />
    </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
const props = defineProps({
    name: {
        type: String,
        required: true,
    }
});
const router = useRouter();
const toggleIdList = ref([]);
const menuData = computed(() => {
    return router.options.routes.filter((item) => !item.hidden);
});
onMounted(() => {
    const res = [];    
    const curPath = router.currentRoute.value.path;
    const tmp1 = menuData.value.filter(e=>curPath.startsWith(e.path))[0];
    if (tmp1) {
        res.push(tmp1.meta.id);
        const tmp2 = curPath.split('/');
        if (tmp2.length > 3 && tmp1.children) {
            tmp1.children.forEach(child=>{
                if (tmp2.includes(child.path)) res.push(child.meta.id);
            })
        }
    }
    toggleIdList.value = res;
})
</script>