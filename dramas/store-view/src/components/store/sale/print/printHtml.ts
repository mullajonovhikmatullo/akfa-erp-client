export function escapeHtml(value: string): string {
  //
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function printHtml(html: string) {
  //
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(frame)

  const frameWindow = frame.contentWindow
  if (!frameWindow) {
    frame.remove()
    return
  }

  frameWindow.document.open()
  frameWindow.document.write(html)
  frameWindow.document.close()
  frameWindow.addEventListener('afterprint', () => setTimeout(() => frame.remove(), 0), { once: true })
  frameWindow.focus()
  frameWindow.print()
}
