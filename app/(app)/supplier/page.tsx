// Layout & AppShell sudah ditangani app/(app)/layout.tsx, jadi halaman
// ini cukup Server Component yang merender view.
import { Suppliers } from '@/components/views/suppliers'

export default function Page() {
  return <Suppliers />
}
