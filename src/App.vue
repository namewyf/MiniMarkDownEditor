<template>
  <div class="root">
    <div class="config"></div>
    <div class="top"></div>
    <div class="content">
      <div class="left"></div>
      <div class="right"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"

</script>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  padding: 20px;

  .config {
    width: 1000px;
    height: 50px;
    background-color: pink;
  }

  .top {
    width: 1000px;
    height: 50px;
    background-color: red;
  }

  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1000px;
    height: 700px;

    .left {
      width: 50%;
      height: 100%;
      background-color: green;
    }

    .right {
      width: 50%;
      height: 100%;
      background-color: yellow;
    }
  }
}
</style>
