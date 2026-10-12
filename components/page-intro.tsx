export function PageIntro({
  title,
  subtitle,
  eyebrow = 'MANAJEMEN APOTEK',
  action,
}: {
  title: string
  subtitle: string
  eyebrow?: string
  action?: React.ReactNode
}) {
  return (
    <section className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
      {action}
    </section>
  )
}