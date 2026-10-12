// Layout & AppShell sudah ditangani app/(app)/layout.tsx, jadi halaman
// ini cukup Server Component yang merender view.
import { Categories } from '@/components/views/categories'

export default function Page() {
  return <Categories />
}
