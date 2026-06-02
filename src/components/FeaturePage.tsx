import { Link } from 'react-router-dom'

interface FeaturePageProps {
  title: string
  description: string
  backTo: string
  backLabel: string
}

export default function FeaturePage({
  title,
  description,
  backTo,
  backLabel,
}: FeaturePageProps) {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold text-blue-600">기능 준비 중</p>
      <h1 className="mt-2 text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-sm text-slate-600">{description}</p>
      <Link
        to={backTo}
        className="mt-6 inline-block rounded-lg border px-4 py-2 text-sm"
      >
        {backLabel}
      </Link>
    </section>
  )
}
