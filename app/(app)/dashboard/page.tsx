// Layout & AppShell sudah ditangani app/(app)/layout.tsx, jadi halaman
// ini cukup Server Component yang merender dashboard.
import { Dashboard } from './_components/dashboard'

export default function Page() {
  return <Dashboard />
}