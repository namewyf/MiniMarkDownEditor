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
        <textarea v-model="textarea" style="width: 100%" :rows="26" type="textarea" placeholder="Please input" ref="input" id="input">
        </textarea>
      </div>
      <div class="right">
        <div v-html="htmlContent" ref="showArea"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch,useTemplateRef, type ShallowRef} from 'vue'
import { markdownTokenizer, renderHTML } from './api/index'
import { Link, Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue'
import IconListInfo from '@/assets/iconfont/iconfont.json'
import toHTML from './utils/toHTML'
import toPDF from './utils/toPDF'
const heading_num=[1,2,3,4,5]
const textarea = ref(``)
const htmlContent = ref(``)
let inputref: ShallowRef = useTemplateRef<HTMLInputElement>("input")
let showArea:ShallowRef=useTemplateRef("showArea")
watch(textarea, (newValue) => {
  const tokenList = markdownTokenizer(newValue)
  htmlContent.value = renderHTML(tokenList)
})
//快捷键栏
const iconList = IconListInfo.glyphs

function insertAtCursor(item: any, event) {
  event.preventDefault()
  if (item.name == "Heading") return;
  const length = ref(textarea.value.length)
  if (inputref.value.selectionStart == inputref.value.selectionEnd) {
    textarea.value = textarea.value.substring(0, inputref.value.selectionStart) +
      item.markdown +
      textarea.value.substring(inputref.value.selectionStart, length.value);
  }
  else {
    if (item.type == "none") {
      textarea.value = textarea.value.substring(0, inputref.value.selectionEnd) +
      item.markdown +
      textarea.value.substring(inputref.value.selectionEnd, length.value);
    }
    else if (item.type == "prefix") {
      //若选中文本已经采用了markdown语法则进行还原
      /* if (textarea.value.substring(inputref.value.selectionStart, inputref.value.selectionEnd).startsWith(item.addContent)) {
        inputref.value.setRangeText(textarea.value.substring(inputref.value.selectionStart + item.addContent.length, inputref.value.selectionEnd))
      } */
      inputref.value.setRangeText(item.addContent + textarea.value.substring(inputref.value.selectionStart, inputref.value.selectionEnd))
    }
    else if (item.type == "sandwich") {
      inputref.value.setRangeText(item.addContent + textarea.value.substring(inputref.value.selectionStart, inputref.value.selectionEnd)+item.addContent)
    }
  }
}
function insertAtCursor_heading(num:number,event) {
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

    .left {
      width: 50%;
      height: 100%;
      background-color: var(--bgColor);
  color: var(--textColor);
  border-color: var(--borderColoir);
  border-style: solid;
    }

    .right {
      white-space: pre-line;
      width: 600px;
      height: 560px;
      overflow: scroll;
      background-color: black;background-color: var(--bgColor);
  color: var(--textColor);
  border-color: var(--borderColoir);
  border-style: solid;
    }

    blockquote {
      border-left: 8px solid #ccc;
      padding-left: 8px;
      margin: 5px 0;
      border-radius: 0px;
    }
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
</style>
