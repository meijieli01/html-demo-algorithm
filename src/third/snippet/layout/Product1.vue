<template>
    <Layout1>
        <template #sidebar>
            <Sidebar name="product" class="" />
        </template>
        <template #default>
            <TopBar name="product"/>
            <section class="app-main">
                <router-view />
            </section>
        </template>
    </Layout1>
</template>
<script setup>
import Layout1 from './layout1.vue';
import TopBar from './Topbar.vue';
import Sidebar from './SidebarTree.vue';
</script>