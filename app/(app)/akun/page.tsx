// Layout & AppShell sudah menangani app/(app)/layout.tsx, jadi halaman
// ini cukup Server Component yang merender view.
import { Accounts } from '@/components/views/accounts'

export default function Page() {
  return <Accounts />
}
