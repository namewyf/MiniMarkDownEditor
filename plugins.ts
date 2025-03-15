// plugins.d.ts
import { ref } from 'vue'

export class EditorPlugin {
  constructor() {
    this.name = ''
    this.init = () => {}
  }
  name: string // 插件名称
  // 初始化方法，接收编辑器的上下文信息
  init: (context: {
    textarea: ReturnType<typeof ref<string>>
    htmlContent: ReturnType<typeof ref<string>>
    inputref: null | ReturnType<typeof ref<HTMLTextAreaElement>>
    showArea: null | ReturnType<typeof ref<boolean>>
  }) => void
  // 可选：销毁方法，用于清理插件使用的资源
  destroy?: () => void
}
