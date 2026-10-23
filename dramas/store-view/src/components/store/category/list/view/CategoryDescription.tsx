import { useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { StoreIcon } from '@store/store-shared/ui/store-icon'

interface CategoryDescriptionProps {
  text: string
  expandLabel: string
  collapseLabel: string
}

export function CategoryDescription({ text, expandLabel, collapseLabel }: CategoryDescriptionProps) {
  //
  const textRef = useRef<HTMLSpanElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [truncated, setTruncated] = useState(false)

  useLayoutEffect(() => {
    //
    const node = textRef.current
    if (!node || expanded) return undefined
    const measure = () => setTruncated(node.scrollWidth > node.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [expanded, text])

  function toggle(event: MouseEvent | KeyboardEvent) {
    //
    event.stopPropagation()
    if (window.getSelection()?.toString()) return
    setExpanded((value) => !value)
  }

  const interactive = truncated || expanded

  return (
    <div
      className={`category-description${expanded ? ' category-description--expanded' : ''}${interactive ? ' category-description--interactive' : ''}`}
      {...(interactive && {
        role: 'button',
        tabIndex: 0,
        'aria-expanded': expanded,
        'aria-label': expanded ? collapseLabel : expandLabel,
        onClick: toggle,
        onKeyDown: (event: KeyboardEvent) => {
          //
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          toggle(event)
        },
      })}
    >
      <span ref={textRef} className="category-description__text">{text}</span>
      {interactive ? <StoreIcon name="arrow-down" size={14} className="category-description__chevron" /> : null}
    </div>
  )
}
