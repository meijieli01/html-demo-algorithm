<template>
    <router-view />
    <BModalOrchestrator />
    <BToastOrchestrator />
</template>

<script setup>
import { BModalOrchestrator, BToastOrchestrator } from 'bootstrap-vue-next';
</script>
