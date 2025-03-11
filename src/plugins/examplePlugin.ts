// plugins/examplePlugin.ts
import { EditorPlugin } from '../../plugins'

const examplePlugin: EditorPlugin = {
  name: 'ExamplePlugin',
  init: ({ textarea }) => {
    // 在插件初始化时，添加一个新的快捷键处理逻辑
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault()
        textarea.value += 'This is an example text inserted by the plugin.'
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // 可以在插件销毁时移除事件监听器
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  },
}

export default examplePlugin
