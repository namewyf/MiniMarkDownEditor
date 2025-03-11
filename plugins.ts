// plugins.d.ts
import { ref, ShallowRef } from 'vue'

export interface EditorPlugin {
  // 插件名称
  name: string
  // 初始化方法，在插件加载时调用
  init: (editor: {
    textarea: ReturnType<typeof ref<string>>
    htmlContent: ReturnType<typeof ref<string>>
    inputref: ShallowRef<HTMLTextAreaElement>
    showArea: ShallowRef<HTMLElement>
    insertAtCursor: (item: any, event: any) => void
    insertAtCursor_heading: (num: number, event: any) => void
    handleKeyDown: (event: any) => void
  }) => void
}
