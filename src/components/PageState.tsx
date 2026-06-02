export function Loading() {
  return <p className="text-sm text-slate-600">데이터를 불러오고 있습니다.</p>
}

export function Empty({ children }: { children: string }) {
  return (
    <p className="rounded-xl border border-dashed bg-white p-6 text-sm text-slate-500">
      {children}
    </p>
  )
}

export function Message({ children }: { children: string }) {
  return <p className="mt-3 text-sm text-blue-700">{children}</p>
}
