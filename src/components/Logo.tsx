type LogoProps = {
  variant?: 'full' | 'mark'
  inverted?: boolean
}

export function Logo({ variant = 'full', inverted = false }: LogoProps) {
  return (
    <div className={`logo ${inverted ? 'logo--inverted' : ''}`}>
      <img
        className={`logo__image logo__image--${variant}`}
        src="/images/Logo-oficial-Colombia-GO.jpeg"
        alt="ColombiaGO"
      />
    </div>
  )
}
