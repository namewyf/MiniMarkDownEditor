<template>
  <div class="root">
    <div class="config"></div>
    <div class="top">
    </div>
    <div class="content">
      <div class="left">
        <el-input v-model="textarea" style="width: 100%" :rows="26" type="textarea" placeholder="Please input" />
      </div>
      <div class="right">
        <div v-html="htmlContent"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import { markdownTokenizer, renderHTML } from './api/index.ts'
import { Link, Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue'
const textarea = ref(``)
const htmlContent = ref(``);

watch(textarea, (newValue) => {
  const tokenList = markdownTokenizer(newValue)
  htmlContent.value = renderHTML(tokenList)
})

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
  background-color: white;

  .config {
    width: 1200px;
    height: 50px;
    background-color: pink;
  }

  .top {
    width: 1200px;
    height: 50px;
    background-color: yellow;
  }

  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1200px;
    height: 700px;

    .left {
      width: 50%;
      height: 100%;
    }

    .right {
      white-space: pre-line;
      width: 600px;
      height: 560px;
      overflow: scroll;
      background-color: black;
    }
  }
}
</style>
