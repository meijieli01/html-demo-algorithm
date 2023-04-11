<template>
    <div class="layout-topbar">
        <span class="flex-grow-1" v-html="store.getters['title']"></span>
        <div class="flex-grow-1 d-flex route-list">
            <div class="my-auto mx-3" v-for="(sub,i) in viewerInfo" :key="i">
                <router-link :to="sub.path" class="" :class="{ active: $route.path === sub.path }" v-html="sub.name"></router-link>
            </div>
        </div>
        <div class="info flex-end">
            <div>
                <i class="el-icon-s-custom"></i>
                {{ userName }}
            </div>
            欢迎登录 <em>|</em>
            <div @click="logout">退出</div>
        </div>
    </div>
</template>
<script setup>
import { reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
const props = defineProps({
    name: {
        type: String,
        required: true,
    }
});
const store = useStore();
const router = useRouter();
const viewerList = router.options.routes.filter(e=>e.path.startsWith('/viewer'));
const viewerInfo = [];
viewerList.forEach(e=>{
    e.children.forEach(t=>{        
        viewerInfo.push({
            path: `${e.path}/${t.path}`,
            name: t.meta.label,
        })
    })
})
const userName = store.getters['user/info'].userName;
async function logout() {
    await store.dispatch('user/logout');
    location.reload();
}
</script>