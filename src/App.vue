<template>
  <div class="root">
    <div class="config"></div>
    <div class="top"></div>
    <div class="content">
      <div class="left">
        <el-input
          v-model="textarea"
          class="textarea"
          :rows="26"
          type="textarea"
          placeholder="请输入 Markdown 内容..."
        />
      </div>
      <div class="right">
        <div class="preview" v-html="htmlContent"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { markdownTokenizer, renderHTML } from "./api/index.ts";

const textarea = ref("");
const htmlContent = ref("");

watch(textarea, (newValue) => {
  const tokenList = markdownTokenizer(newValue);
  htmlContent.value = renderHTML(tokenList);
});
</script>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  height: 100vh;
  padding: 20px;
  background-color: #f4f4f4;
}

.config {
  width: 1200px;
  height: 50px;
  background-color: #ff7096;
  border-radius: 8px;
  margin-bottom: 10px;
}

.top {
  width: 1200px;
  height: 50px;
  background-color: #ffd166;
  border-radius: 8px;
  margin-bottom: 20px;
}

.content {
  display: flex;
  justify-content: space-between;
  width: 1200px;
  height: 700px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.left {
  width: 48%;
  height: 100%;
}

.right {
  width: 48%;
  height: 100%;
  overflow: auto;
  background-color: #1e1e1e;
  color: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.1);
}

.textarea {
  width: 100%;
  height: 100%;
  font-size: 16px;
  border-radius: 8px;
}

.preview {
  white-space: pre-line;
  line-height: 1.6;
}
</style>
