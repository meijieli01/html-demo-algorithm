<template>
    <Layout1>
        <template #sidebar>
            <Sidebar name="sadmin" class="" />
        </template>
        <template #default>
            <TopBar name="sadmin"/>
            <section class="app-main">
                <router-view />
            </section>
        </template>
    </Layout1>
</template>
<script setup>
import Layout1 from './layout1.vue';
import TopBar from './Topbar.vue';
import Sidebar from './Sidebar.vue';
</script>