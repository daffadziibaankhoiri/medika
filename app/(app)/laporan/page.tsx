// Layout & AppShell sudah ditangani app/(app)/layout.tsx, jadi halaman
// ini cukup Server Component yang merender view.
import { Reports } from '@/components/views/reports'

export default function Page() {
  return <Reports />
}
