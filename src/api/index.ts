// type: 用于标识节点类型。
// tag: 用于标识 HTML 标签名。
// nesting: 用于标识嵌套级别。
// level: 用于标识标题级别。
// children: 用于存储子节点。
// content: 用于存储节点内容。
// markup: 用于存储 Markdown 标记。
// block: 用于标识是否是块级元素。
// markdownParser.js
interface Token {
  type: string
  content?: string
  tag?: string
  nesting?: number
  level?: number
  children?: Token[] // 递归定义子 token
  markup?: string
  block?: boolean
}

function markdownTokenizer(str: string) {
  const tokens: Token[] = []
  let state = startState

  for (const char of str) {
    state = state(char)
  }

  function startState(char: string) {
    if (char === '#') {
      return headingState(1)
    } else if (char === '>') {
      tokens.push({ type: 'blockquote_open', tag: 'blockquote', nesting: 1 })
      return blockquoteState
    } else if (char === '*') {
      return boldOrItalicState
    } else if (char === '[') {
      tokens.push({ type: 'link_open', tag: 'a', nesting: 1 })
      return linkTextState
    } else if (char === '`') {
      tokens.push({ type: 'codeblock_open', tag: 'code', nesting: 1 })
      return codeblockState
    } else if (char === '|') {
      tokens.push({ type: "table_start", tag: 'table' })
      tokens.push({type:'theadb',tag:"thead"})
      tokens.push({ type: 'table_line_start', tag: 'tr' })
      tokens.push({type:'thead_start',tag:'th'})
      return tableHeadState
    } else {
      tokens.push({ type: 'text', content: char })
      return textState
    }
  }

  function tableHeadState(char:string) {
    if (char === '|') {
      tokens.push({ type: "thead_end", tag: 'th' })
      tokens.push({ type: 'thead_start', tag: "th" })
      return tableHeadState
    } else if (char === '\n') {
      tokens.pop()
      tokens.push({ type: "table_line_end", tag: 'tr' })
      tokens.push({type:'theade',tag:'thead'})
      return tableDivide
    } else {
      tokens.push({ type: 'text', content: char })
      return tableHeadState
    }
  }
  function tableDivide(char:string) {
    if (char === '\n') {
      tokens.push({type:"tbodyb",tag:'tbody'})
      tokens.push({type:"table_line_start",tag:"tr"})
      return function (char: string) {
        if (char === '|') {
          tokens.push({ type: 'tbody_start', tag: 'td' })
          return tableBodyState
        }
        else return tableDivide
      }
    }
    return tableDivide
  }

  function tableBodyState(char:string) {
    if (char === '|') {
      tokens.push({ type: 'tbody_end', tag: 'td' })
      tokens.push({ type: 'tbody_start', tag: 'td' })
      return tableBodyState
    } else if(char==='\n'){
      tokens.pop()
      tokens.push({ type: "table_line_end", tag: 'tr' })
      return function (char:string) {
        if (char === '|') {
          tokens.push({ type: 'tbody_end', tag: 'td' })
          tokens.push({ type: 'tbody_start', tag: 'td' })
          return tableBodyState
        } else if(char==='\n'){
          tokens.pop()
          tokens.push({ type: "table_line_end", tag: 'tr' })
            tokens.push({type:"tbodye",tag:'tbody'})
            tokens.push({ type: "table_end", tag: 'table' })
            return startState
        } else {
          tokens.push({ type: "text", content: char })
          return tableBodyState
        }
      }
    } else {
      tokens.push({ type: "text", content: char })
      return tableBodyState
    }
  }
  function headingState(level: number) {
    return function (char: string) {
      if (char === '#') {
        return headingState(level + 1)
      } else if (char === ' ') {
        tokens.push({ type: 'heading_open', tag: `h${level}`, nesting: 1 })
        return headingContentState(level)
      } else {
        tokens.push({ type: 'text', content: '#'.repeat(level) + char })
        return textState
      }
    }
  }

  function headingContentState(level: number) {
    return function (char: string) {
      if (char === '\n') {
        tokens.push({ type: 'heading_close', tag: `h${level}`, nesting: -1 })
        return startState
      } else {
        tokens.push({ type: 'text', content: char })
        return headingContentState(level)
      }
    }
  }

  function blockquoteState(char: string) {
    if (char === '\n') {
      tokens.push({ type: 'blockquote_close', tag: 'blockquote', nesting: -1 })
      return startState
    } else {
      if (char === '>') {
        tokens.push({ type: 'blockquote_open', tag: 'blockquote', nesting: 1 })
        return blockquoteState
      }
      tokens.push({ type: 'text', content: char })
      return blockquoteState
    }
  }

  function codeblockState(char: string) {
    if (char === '`') {
      tokens.push({ type: 'codeblock_close', tag: 'code', nesting: -1 })
      return startState
    } else {
      tokens.push({ type: 'text', content: char })
      return codeblockState
    }
  }

  function boldOrItalicState(char: string) {
    if (char === '*') {
      tokens.push({ type: 'bold_open', tag: 'strong', nesting: 1 })
      return boldContentState
    } else {
      tokens.push({ type: 'italic_open', tag: 'em', nesting: 1 })
      return italicContentState(char)
    }
  }

  function boldContentState(char: string) {
    if (char === '*' && tokens[tokens.length - 1].content === '*') {
      tokens.pop() // Remove the last text token which is '*'
      tokens.push({ type: 'bold_close', tag: 'strong', nesting: -1 })
      return startState
    } else {
      tokens.push({ type: 'text', content: char })
      return boldContentState
    }
  }

  function italicContentState(char: string) {
    if (char === '*') {
      tokens.push({ type: 'italic_close', tag: 'em', nesting: -1 })
      return startState
    } else {
      tokens.push({ type: 'text', content: char })
      return italicContentState
    }
  }

  function linkTextState(char: string) {
    if (char === ']') {
      tokens.push({ type: 'link_text_close' })
      return linkHrefState
    } else {
      tokens.push({ type: 'link_text', content: char })
      return linkTextState
    }
  }

  function linkHrefState(char: string) {
    if (char === '(') {
      return linkHrefContentState
    } else {
      return startState(char)
    }
  }

  function linkHrefContentState(char: string) {
    if (char === ')') {
      tokens.push({ type: 'link_close', tag: 'a', nesting: -1 })
      return startState
    } else {
      tokens.push({ type: 'link_href', content: char })
      return linkHrefContentState
    }
  }

  function textState(char: string) {
    if (char === '\n') {
      return startState
    } else {
      tokens.push({ type: 'text', content: char })
      return textState
    }
  }

  return tokens
}

function renderHTML(tokens:any[]) {
  let html = ''
  let linkText = ''
  let linkHref = ''

  function renderToken(token:any) {
    switch (token.type) {
      case 'heading_open':
        return `<${token.tag}>`
      case 'heading_close':
        return `</${token.tag}>`
      case 'blockquote_open':
        return `<${token.tag}>`
      case 'blockquote_close':
        return `</${token.tag}>`
      case 'bold_open':
        return `<${token.tag}>`
      case 'bold_close':
        return `</${token.tag}>`
      case 'italic_open':
        return `<${token.tag}>`
      case 'italic_close':
        return `</${token.tag}>`
      case 'link_open':
        linkText = ''
        linkHref = ''
        return ''
      case 'link_text':
        linkText += token.content
        return ''
      case 'link_text_close':
        return ''
      case 'link_href':
        linkHref += token.content
        return ''
      case 'link_close':
        return `<a href="${linkHref}">${linkText}</a>`
      case 'codeblock_open':
        return `<${token.tag}>`
      case 'codeblock_close':
        return `</${token.tag}>`
      case `table_start`:
        return `<${token.tag}>`
      case `table_line_start`:
        return `<${token.tag}>`
      case `thead_start`:
        return `<${token.tag}>`
      case `tbody_start`:
        return `<${token.tag}>`
      case `table_end`:
          return `</${token.tag}>`
      case `table_line_end`:
          return `</${token.tag}>`
      case `thead_end`:
          return `</${token.tag}>`
      case `tbody_end`:
        return `</${token.tag}>`
      case 'theadb':
          return `<${token.tag}>`
      case 'theade':
        return `</${token.tag}>`
      case 'tbodyb':
          return `<${token.tag}>`
      case 'tbodye':
          return `</${token.tag}>`
      case 'text':
        return token.content
      default:
        return ''
    }
  }

  for (const token of tokens) {
    html += renderToken(token)
  }

  return html
}

export { markdownTokenizer, renderHTML }
