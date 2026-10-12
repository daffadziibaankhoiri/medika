// Layout & AppShell sudah ditangani app/(app)/layout.tsx, jadi halaman
// ini cukup Server Component yang merender view.
import Kasir from '@/components/views/cashier'

export default function Page() {
  return <Kasir />
}