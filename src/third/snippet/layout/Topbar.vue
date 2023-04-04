<template>
    <div class="layout-topbar">
        <span class="flex-grow-1" v-html="store.getters['title']"></span>
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
const props = defineProps({
    name: {
        type: String,
        required: true,
    }
});
const store = useStore();
const userName = store.getters['user/info'].userName;
async function logout() {
    await store.dispatch('user/logout');
    location.reload();
}
</script>