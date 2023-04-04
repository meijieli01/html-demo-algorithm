<template>
    <div class="layout1-app-wrapper d-flex">
        <div class="side-left">
            <slot name="sidebar" />
        </div>
        <div class="side-content">
            <slot />
        </div>
    </div>
</template>
<script setup>

</script>