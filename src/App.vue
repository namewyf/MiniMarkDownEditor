<template>
  <div class="root">
    <div class="config"></div>
    <div class="top">
      <button class="iconfont" v-html="'&#x' + item.unicode + ';'" v-for="item in iconList"
        :key="item.icon_id"></button>

    <button class="toolbar-btn" @click="insertOrderedList">
      <el-icon><List /></el-icon> <!-- 这是有序列表图标,查了半天不知道图标是什么，先这样代替一下 -->
    </button>
    <button class="toolbar-btn" @click="insertUnorderedList">
      <el-icon><Menu /></el-icon> <!-- 这是无序列表图标，同有序列表一样，我只能用自己熟悉的了 -->
    </button>
    <button class="toolbar-btn" @click="insertTable"><!-- 这是表格图标 -->
      <el-icon><Grid /></el-icon>
    </button>

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
import { ref, watch,onMounted } from 'vue'
import { markdownTokenizer, renderHTML } from './api/index'
import { Link, Delete, Edit, Search, Share, Upload, List, Menu, Grid } from '@element-plus/icons-vue'
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

const insertOrderedList = () => {
  textarea.value += '\n1.    \n2.    \n3.    '
}

const insertUnorderedList = () => {
  textarea.value += '\n- \n  \n- \n  \n- \n  '
}

const insertTable = () => {
  const tableTemplate = `
| 表头1 | 表头2 |
|-------|-------|
| 内容1 | 内容2 |
| 内容3 | 内容4 |`
  textarea.value += tableTemplate
}
// 处理键盘按下事件
const handleKeyDown = (event:any) => {
  const start = event.target.selectionStart;
  const end = event.target.selectionEnd;
  const selectedText = textarea.value.slice(start, end);

  // 处理 Ctrl + B（加粗）快捷键
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault();
    const newText = `**${selectedText}**`;
    replaceText(newText, start, end, event);
  }

  // 处理 Ctrl + I（倾斜）快捷键
  if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
    event.preventDefault();
    const newText = `*${selectedText}*`;
    replaceText(newText, start, end, event);
  }

  // 处理 Ctrl + Shift + K（代码块）快捷键
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'k') {
    event.preventDefault();
    const newText = `\`${selectedText}\``;
    replaceText(newText, start, end, event);
  }

  // 处理 Ctrl + 1 - 6（标题）快捷键
  for (let i = 1; i <= 6; i++) {
    if ((event.ctrlKey || event.metaKey) && event.key === `${i}`) {
      event.preventDefault();
      const newText = `${'#'.repeat(i)} ${selectedText}`;
      replaceText(newText, start, end, event);
    }
  }
};

// 替换文本并更新光标位置
const replaceText = (newText:any, start:any, end:any ,event:any) => {
  textarea.value = textarea.value.slice(0, start) + newText + textarea.value.slice(end);
  const newCursorPosition = start + newText.length;
  const content = event.target;
  content.selectionStart = newCursorPosition;
  content.selectionEnd = newCursorPosition;

  // 重新渲染 HTML
  const tokens = markdownTokenizer(textarea.value);
  htmlContent.value = renderHTML(tokens);
};


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

.toolbar-btn {
  padding: 8px;
  margin: 0 4px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background-color: #f0f0f0;
  border-radius: 4px;
}

.toolbar-btn.iconfont {
  font-size: 20px;
  color: #333;
}
</style>
