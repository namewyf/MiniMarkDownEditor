<template>
  <div class="root">
    <div class="config"></div>
    <div class="top">
      <button class="iconfont" v-html="'&#x' + item.unicode + ';'" v-for="item in iconList"
        :key="item.icon_id"></button>
    </div>
    <div class="content">
      <div class="left">
        <el-input v-model="textarea" style="width: 100%" :rows="26" type="textarea" placeholder="Please input">
        </el-input>
      </div>
      <div class="right">
        <div v-html="htmlContent"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { markdownTokenizer, renderHTML } from './api/index'
import { Link, Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue'
import IconListInfo from '@/assets/iconfont/iconfont.json'
const textarea = ref(``)
const htmlContent = ref(``)
onMounted(() => {
  const savedData = window.localStorage.getItem('textarea');
  if (savedData) {
    textarea.value = savedData;
  }
});
watch(textarea, (newVal) => {
  window.localStorage.setItem('textarea', newVal);
});
watch(textarea, (newValue) => {
  const tokenList = markdownTokenizer(newValue)
  htmlContent.value = renderHTML(tokenList)
})
//快捷键栏
const iconList = IconListInfo.glyphs
</script>

<style>
@import '@/assets/iconfont/iconfont.css';

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
    display: flex;
    flex-direction: row;
    justify-content: left;
    flex-wrap: nowrap;
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

    blockquote {
      border-left: 8px solid #ccc;
      padding-left: 8px;
      margin: 5px 0;
      border-radius: 0px;
    }
  }
}
</style>
