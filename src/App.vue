<template>
  <div class="root">
    <div class="config">
      <button class="theme_change" @click="changeTheme">Theme</button>
      <span class="iconfont_func" style="user-select: none;" @click="toPDF(showArea)">&#xe600;</span>
      <span class="iconfont_func" style="user-select: none;" @click="toHTML(showArea)">&#xe60a;</span>
      <button class="theme_change" @click="loadPluginButtonClick">Load Plugin</button>
    </div>
    <div class="top">
      <div class="iconfont" v-for="item in iconList" :key="item.icon_id" :class="item.name"
        @mousedown.prevent.stop="insertAtCursor(item, $event)" style="user-select: none;">
        <span v-html="'&#x' + item.unicode + ';'"></span>
        <div class="HeadSelect" v-if="item.name == 'Heading'">
          <button class="selection" v-for="item in heading_num" :key="item"
            @mousedown.prevent.stop="insertAtCursor_heading(item, $event)">{{ "Heading" + item }}</button>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="left">
        <textarea v-model="textarea" style="width: 100%" :rows="26" type="textarea" placeholder="Please input"
          ref="input" id="input" @keydown="handleKeyDown" @scroll="handleLeftScroll">
        </textarea>
      </div>
      <div class="right" @scroll="handleRightScroll">
        <div v-html="htmlContent" ref="showArea"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, useTemplateRef, onMounted, type ShallowRef } from 'vue';
import { markdownTokenizer, renderHTML } from './api/index';
import { Link, Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue';
import IconListInfo from '@/assets/iconfont/iconfont.json';
import toHTML from './utils/toHTML';
import toPDF from './utils/toPDF';
import type { EditorPlugin } from '../plugins.ts';

const textarea = ref('');
const htmlContent = ref('');
const inputref: ShallowRef = useTemplateRef('input');
const showArea = useTemplateRef('showArea');
const isSyncing = ref(false);
const cachedText = ref('');
const cachedHTML = ref('');

// 插件容器
const plugins = ref<EditorPlugin[]>([]);

// 注册插件的方法
const registerPlugin = (plugin: EditorPlugin) => {
  plugins.value.push(plugin);
  plugin.init({
    textarea,
    htmlContent,
    inputref,
    showArea
  });
};

// 节流函数
const throttle = (func: () => void, delay: number) => {
  let timer: number | null = null;
  return () => {
    if (!timer) {
      func();
      timer = setTimeout(() => {
        timer = null;
      }, delay);
    }
  };
};

// 同步右侧滚动
const syncRightScroll = () => {
  if (isSyncing.value) return;
  isSyncing.value = true;
  const input = inputref.value as HTMLTextAreaElement;
  const preview = showArea.value as HTMLElement;
  const scrollRatio = input.scrollTop / (input.scrollHeight - input.clientHeight);
  preview.scrollTop = scrollRatio * (preview.scrollHeight - preview.clientHeight);
  isSyncing.value = false;
};

// 同步左侧滚动
const syncLeftScroll = () => {
  if (isSyncing.value) return;
  isSyncing.value = true;
  const input = inputref.value as HTMLTextAreaElement;
  const preview = showArea.value as HTMLElement;
  const scrollRatio = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
  input.scrollTop = scrollRatio * (input.scrollHeight - input.clientHeight);
  isSyncing.value = false;
};

// 节流后的滚动处理函数
const handleLeftScroll = throttle(syncRightScroll, 50);
const handleRightScroll = throttle(syncLeftScroll, 50);

watch(textarea, (newValue) => {
  // 找出文本中发生变化的部分
  const startIndex = findCommonPrefixLength(cachedText.value, newValue);
  const endIndex = findCommonSuffixLength(cachedText.value, newValue, startIndex);

  const unchangedStart = cachedHTML.value.slice(0, startIndex);
  const unchangedEnd = cachedHTML.value.slice(endIndex);

  const changedText = newValue.slice(startIndex, newValue.length - (cachedText.value.length - endIndex));
  const tokenList = markdownTokenizer(changedText);
  const changedHTML = renderHTML(tokenList);

  htmlContent.value = unchangedStart + changedHTML + unchangedEnd;
  cachedText.value = newValue;
  cachedHTML.value = htmlContent.value;
  window.localStorage.setItem('textarea', newValue);
});

// 查找两个字符串的公共前缀长度
const findCommonPrefixLength = (str1: string, str2: string) => {
  let i = 0;
  while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
    i++;
  }
  return i;
};

// 查找两个字符串从指定位置开始的公共后缀长度
const findCommonSuffixLength = (str1: string, str2: string, startIndex: number) => {
  let i = str1.length - 1;
  let j = str2.length - 1;
  while (i >= startIndex && j >= startIndex && str1[i] === str2[j]) {
    i--;
    j--;
  }
  return i + 1;
};

const heading_num = [1, 2, 3, 4, 5];

// 处理键盘按下事件
const handleKeyDown = (event: any) => {
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
const replaceText = (newText: any, start: any, end: any, event: any) => {
  textarea.value = textarea.value.slice(0, start) + newText + textarea.value.slice(end);
  const newCursorPosition = start + newText.length;
  const content = event.target;
  content.selectionStart = newCursorPosition;
  content.selectionEnd = newCursorPosition;

  // 重新渲染 HTML
  const tokens = markdownTokenizer(textarea.value);
  htmlContent.value = renderHTML(tokens);
};

onMounted(() => {
  const savedData = window.localStorage.getItem('textarea');
  if (savedData) {
    textarea.value = savedData;
    const tokenList = markdownTokenizer(savedData);
    htmlContent.value = renderHTML(tokenList);
    cachedText.value = savedData;
    cachedHTML.value = htmlContent.value;
  }
  console.log('inputref:', inputref.value);
  console.log('showArea:', showArea.value);
});

const iconList = IconListInfo.glyphs;

let olCounter = 1;
let isInOrderedList = false;

function insertAtCursor(item: any, event: any) {
  event.preventDefault();
  if (item.name === 'Heading') return;
  const length = textarea.value.length;
  // 工具栏的核心渲染逻辑
  if (inputref.value.selectionStart === inputref.value.selectionEnd) {
    let insertContent = item.markdown;

    if (item.name === 'OrderedList') {
      const textBeforeCursor = textarea.value.substring(0, inputref.value.selectionStart);
      const lines = textBeforeCursor.split('\n');
      const currentLineIndex = lines.length - 1;

      const prevLine = currentLineIndex > 0 ? lines[currentLineIndex - 1] : '';
      const isPrevLineOrderedList = /^\d+\./.test(prevLine);

      if (!isPrevLineOrderedList) {
        olCounter = 1;
        isInOrderedList = true;
      }

      insertContent = `${olCounter}. `;
      olCounter++;

      const currentLine = lines[currentLineIndex] || '';
      if (currentLine.length > 0) {
        insertContent = '\n' + insertContent;
      }
    } else {
      isInOrderedList = false;
      olCounter = 1;
    }

    textarea.value = textarea.value.substring(0, inputref.value.selectionStart) +
      insertContent +
      textarea.value.substring(inputref.value.selectionStart, length);
  }
  // 其它功能渲染逻辑
  else {
    if (item.type === 'none') {
      textarea.value = textarea.value.substring(0, inputref.value.selectionEnd) + item.markdown + textarea.value.substring(inputref.value.selectionEnd, length);
      // 处理图片的插入
    } else if (item.type === 'prefix') {
      inputref.value.setRangeText(item.addContent + textarea.value.substring(inputref.value.selectionStart, inputref.value.selectionEnd));
    } else if (item.type === 'sandwich') {
      inputref.value.setRangeText(item.addContent + textarea.value.substring(inputref.value.selectionStart, inputref.value.selectionEnd) + item.addContent);
    }
  }
}

function insertAtCursor_heading(num: number, event: any) {
  event.preventDefault();
  const length = textarea.value.length;
  if (inputref.value.selectionStart === inputref.value.selectionEnd) {
    textarea.value = textarea.value.substring(0, inputref.value.selectionStart) +
      '#'.repeat(num) +
      ' ' +
      textarea.value.substring(inputref.value.selectionStart, length);
  } else {
    inputref.value.setRangeText('#'.repeat(num) + ' ' + textarea.value.substring(inputref.value.selectionStart, inputref.value.selectionEnd));
  }
}

// 换色
const current_theme = ref('light');
document.documentElement.setAttribute('theme', 'light');
function changeTheme() {
  function changeLight() {
    current_theme.value = 'light';
    document.documentElement.setAttribute('theme', 'light');
  }
  function changeDark() {
    current_theme.value = 'dark';
    document.documentElement.setAttribute('theme', 'dark');
  }
  if (current_theme.value === 'light') changeDark();
  else changeLight();
}

// 示例：动态加载并注册插件
const loadAndRegisterPlugin = async (pluginPath: string) => {
  try {
    const { default: plugin } = await import(pluginPath);
    registerPlugin(plugin);
  } catch (error) {
    console.error('Failed to load plugin:', error);
  }
};

// 可以在合适的时机调用 loadAndRegisterPlugin 方法，例如在按钮点击事件中
const loadPluginButtonClick = () => {
  loadAndRegisterPlugin('./plugins/examplePlugin');
};
</script>

<style>
/* 样式部分保持不变 */
@import '@/assets/iconfont/iconfont.css';
@import '@/assets/func_icon/iconfont_func.css';

.root {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  padding: 20px;
  background-color: var(--bgColor);
  color: var(--textColor);
  border-color: var(--borderColoir);
}

.config {
  width: 1200px;
  height: 50px;
  background-color: var(--bgColor);
  color: var(--textColor);
  border-color: var(--borderColoir);
  display: flex;
  flex-direction: row;
  justify-content: right;
  flex-wrap: nowrap;
  align-items: center;
  border-style: solid;
}

.top {
  width: 1200px;
  height: 50px;
  background-color: yellow;
  display: flex;
  flex-direction: row;
  justify-content: left;
  flex-wrap: nowrap;
  background-color: var(--bgColor);
  color: var(--textColor);
  border-color: var(--borderColoir);
  border-style: solid;
}

.content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1200px;
  height: 700px;
}

.left {
  width: 50%;
  height: 100%;
  background-color: var(--bgColor);
  color: var(--textColor);
  border-color: var(--borderColoir);
  border-style: solid;
}

.right {
  white-space: pre-wrap;
  width: 600px;
  height: 100%;
  overflow: scroll;
  background-color: var(--bgColor);
  color: var(--textColor);
  border-color: var(--borderColoir);
  border-style: solid;
  padding: 10px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.right br {
  display: block;
  margin: 2px 0;
  content: "";
}

blockquote {
  border-left: 8px solid #ccc;
  padding-left: 8px;
  margin: 5px 0;
  border-radius: 0px;
}

.HeadSelect {
  display: none;
  flex-direction: column;
  justify-content: left;
  z-index: 10;
  position: absolute;
  border-style: solid;
  border-radius: 10px;
  border-color: rgb(197, 197, 197);
}

.Heading:hover .HeadSelect {
  display: flex;
}

.selection {
  border: none;
  background-color: white;
  height: 30px;
}

.selection:hover {
  background-color: #e0e0e0;
}

.theme_change {
  border: none;
  border-radius: 10px;
  height: 70%;
}

#input {
  height: 100%;
  background-color: var(--bgColor);
  color: var(--textColor);
}

table {
  width: 200px;
  border-top: 2px solid #999;
  border-left: 2px solid #999;
  border-spacing: 0;
}

table td {
  padding: 10px 30px;
  border-bottom: 2px solid #999;
  border-right: 2px solid #999;
}

table th {
  padding: 10px 30px;
  border-bottom: 2px solid #999;
  border-right: 2px solid #999;
}

.right ul,
.right ol {
  margin: 10px 0;
  padding-left: 20px;
}

.right li {
  margin: 5px 0;
}
</style>