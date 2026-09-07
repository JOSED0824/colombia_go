import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'text'

type Props = {
  variant?: Variant
  children: ReactNode
  withArrow?: boolean
  to?: string
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'primary',
  children,
  withArrow = true,
  to,
  className = '',
  ...rest
}: Props) {
  const classes = `btn btn--${variant} ${className}`.trim()
  const content = (
    <>
      <span>{children}</span>
      {withArrow && variant !== 'text' && <span className="btn__arrow">→</span>}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button className={classes} {...rest}>
      {content}
    </button>
  )
}
