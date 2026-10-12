// Layout & AppShell sudah ditangani app/(app)/layout.tsx, jadi halaman
// ini cukup Server Component yang merender tab stock opname.
import { StockOpname } from './_components/stock-opname'

export default function Page() {
  return <StockOpname />
}