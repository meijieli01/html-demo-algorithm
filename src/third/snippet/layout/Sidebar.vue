<template>
    <ul class="layout-sidebar">
        <SideMenu
            :name="name"
            v-for="item in menuData"
            :key="item.meta.id"
            :node="item"
            :base-path="item.path"
            :createToggleId="currentToggleId"
        />
    </ul>
</template>
<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
const props = defineProps({
    name: {
        type: String,
        required: true,
    }
});
const router = useRouter();
const menuData = computed(() => {
    return router.options.routes.filter((item) => !item.hidden);
});
const currentChildToggleId = router.currentRoute.value.meta.id;
let currentToggleId = '';
for (const item of menuData.value) {
    for (const item2 of item.children) {
        if (item2.meta.id === currentChildToggleId) {
            currentToggleId = item.meta.id;
        }
    }
}
</script>