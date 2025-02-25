export default function toHTML(target:any) {
  const temp = [
    '<!doctype html>',
    '<html>',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<title>Document</title>',
    '</head>',
    '<body>',
    target.innerHTML,
    '</body>',
    '</html>'
  ]
  let dom = temp.join('')
  let a = document.createElement('a')
  let url = window.URL.createObjectURL(
    new Blob([dom], {
      type: ''
    })
  )
  a.href = url
  a.download = `report.html`
  a.click()
  window.URL.revokeObjectURL(url)
}



