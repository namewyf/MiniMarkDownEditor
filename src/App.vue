<template>
  <div class="root">
    <div class="config">
      <button class="theme_change" @click="changeTheme">Theme</button>
      <span class="iconfont_func" style="user-select: none;" @click="toPDF(showArea)">&#xe600;</span>
      <span class="iconfont_func" style="user-select: none;" @click="toHTML(showArea)">&#xe60a;</span>
    </div>
    <div class="top">
      <div class="iconfont"  v-for="item in iconList"
        :key="item.icon_id" :class="item.name" @mousedown.prevent.stop="insertAtCursor(item,$event)" style="user-select: none;">
        <span v-html="'&#x' + item.unicode + ';'"></span>
        <div class="HeadSelect" v-if="item.name=='Heading'">
          <button class="selection" v-for="item in heading_num" :key="item" @mousedown.prevent.stop="insertAtCursor_heading(item,$event)">{{ "Heading"+item }}</button>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="left">
        <textarea v-model="textarea" style="width: 100%" :rows="26" type="textarea" placeholder="Please input" ref="input" id="input" @keydown="handleKeyDown">
        </textarea>
      </div>
      <div class="right">
        <div v-html="htmlContent" ref="showArea"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch ,useTemplateRef,onMounted, type ShallowRef} from 'vue'
import { markdownTokenizer, renderHTML } from './api/index'
import { Link, Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue'
import IconListInfo from '@/assets/iconfont/iconfont.json'
import toHTML from './utils/toHTML'
import toPDF from './utils/toPDF'
const textarea = ref(``)
const htmlContent = ref(``)
const inputref:ShallowRef = useTemplateRef("input")
const showArea=useTemplateRef("showArea")
watch(textarea, (newValue) => {
  const tokenList = markdownTokenizer(newValue)
  htmlContent.value = renderHTML(tokenList)
})
const heading_num=[1,2,3,4,5]
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
onMounted(() => {
  const savedData = window.localStorage.getItem('textarea');
  if (savedData) {
    textarea.value = savedData;
  }
});
watch(textarea, (newVal) => {
  window.localStorage.setItem('textarea', newVal);
});


const iconList = IconListInfo.glyphs

let olCounter = 1;
let isInOrderedList = false;

function insertAtCursor(item: any, event:any) {
  event.preventDefault()
  if (item.name == "Heading") return;
  const length = ref(textarea.value.length)

  if (inputref.value.selectionStart == inputref.value.selectionEnd) {
    let insertContent = item.markdown;

    if (item.name === "OrderedList") {
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
      textarea.value.substring(inputref.value.selectionStart, length.value);
  }
  else {
    if (item.type == "none") {
      textarea.value = textarea.value.substring(0, inputref.value.selectionEnd) +
      item.markdown +
      textarea.value.substring(inputref.value.selectionEnd, length.value);
    }
    else if (item.type == "prefix") {
      inputref.value.setRangeText(item.addContent + textarea.value.substring(inputref.value.selectionStart, inputref.value.selectionEnd))
    }
    else if (item.type == "sandwich") {
      inputref.value.setRangeText(item.addContent + textarea.value.substring(inputref.value.selectionStart, inputref.value.selectionEnd)+item.addContent)
    }
  }
}

function handleInput(event: any) {
  if (event.inputType === 'insertLineBreak') {
    const textBeforeCursor = textarea.value.substring(0, inputref.value.selectionStart);
    const lines = textBeforeCursor.split('\n');
    const lastLine = lines[lines.length - 2] || '';

    if (!lastLine.match(/^\d+\./)) {
      isInOrderedList = false;
      olCounter = 1;
    }
  }
}

function insertAtCursor_heading(num:number,event:any) {
  event.preventDefault()
  const length = ref(textarea.value.length)
  if (inputref.value.selectionStart == inputref.value.selectionEnd) {
    textarea.value = textarea.value.substring(0, inputref.value.selectionStart) +
      "#".repeat(num) +
      " "+
      textarea.value.substring(inputref.value.selectionStart, length.value);
  }
  else {
      inputref.value.setRangeText("#".repeat(num) +" "+ textarea.value.substring(inputref.value.selectionStart, inputref.value.selectionEnd))
  }
}
//换色
const current_theme = ref("light")
document.documentElement.setAttribute("theme","light")
function changeTheme() {
  function changeLight() {
  current_theme.value = "light"
  document.documentElement.setAttribute('theme',"light")
  }
  function changeDark() {
  current_theme.value = "dark"
  document.documentElement.setAttribute("theme","dark")
  }
  if (current_theme.value == "light") changeDark()
  else changeLight()
}

</script>

<style>
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
    justify-content:right;
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
    flex-wrap: nowrap;background-color: var(--bgColor);
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
      height: 560px;
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

  .HeadSelect{
    display: none;
    flex-direction: column;
    justify-content: left;
    z-index: 10;
    position: absolute;
    border-style: solid;
    border-radius: 10px;
    border-color: rgb(197, 197, 197);
  }
  .Heading:hover .HeadSelect{
    display: flex;
  }
  .selection{
    border:none;
    background-color: white;
    height: 30px;
  }
  .selection:hover{
    background-color: #e0e0e0;
  }
  .theme_change{
    border: none;
    border-radius: 10px;
    height: 70%;
  }
  #input{
    height: 100%;
    background-color: var(--bgColor);
    color: var(--textColor);
  }

  .right ul, .right ol {
    margin: 10px 0;
    padding-left: 20px;
  }

  .right li {
    margin: 5px 0;
  }
</style>
