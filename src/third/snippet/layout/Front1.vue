<template>
    <section class="app-main">
        <TopBar name="front"/>
        <router-view />
    </section>
</template>
<script setup>
import TopBar from './Topbar.vue';
</script>