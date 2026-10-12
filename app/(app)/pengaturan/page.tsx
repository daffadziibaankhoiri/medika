// Layout & AppShell sudah ditangani app/(app)/layout.tsx, jadi halaman
// ini cukup Server Component yang merender view.
import { SettingsPage } from '@/components/views/settings-page'

export default function Page() {
  return <SettingsPage />
}
