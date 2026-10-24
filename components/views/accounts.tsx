'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Plus, Search, UserCheck, UserX } from 'lucide-react'
import { Button, DataTable, EmptyRow, Field, Modal, Status } from '@/components/ui'
import { PageIntro } from '@/components/page-intro'
import { useSession } from '@/lib/use-session'
import {
  ASSIGNABLE_ROLES,
  createUser,
  listUsers,
  MIN_PASSWORD_LENGTH,
  removeUser,
  updateUser,
  type AccountStatus,
  type Role,
  type StoredUser,
} from '@/lib/users'

type StatusFilter = 'semua' | AccountStatus

const STATUS_LABEL: Record<AccountStatus, string> = {
  aktif: 'Aktif',
  nonaktif: 'Nonaktif',
  menunggu: 'Menunggu persetujuan',
}

const STATUS_TONE: Record<AccountStatus, 'safe' | 'danger' | 'warning'> = {
  aktif: 'safe',
  nonaktif: 'danger',
  menunggu: 'warning',
}

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'semua', label: 'Semua' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'nonaktif', label: 'Nonaktif' },
  { value: 'menunggu', label: 'Menunggu persetujuan' },
]

/** Batas waktu agar akun masih dianggap online. */
const ONLINE_WINDOW_MS = 5 * 60_000

type LastActive = { text: string; online: boolean; title: string }

/** Tampilan waktu relatif untuk kolom "Terakhir Online". */
function formatLastActive(value: string | null, now: number): LastActive {
  if (!value) {
    return { text: 'Belum pernah login', online: false, title: 'Belum pernah login' }
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return { text: 'Belum pernah login', online: false, title: 'Belum pernah login' }
  }

  const judul = date.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })
  const selisih = now - date.getTime()

  if (selisih < ONLINE_WINDOW_MS) {
    return { text: 'Online', online: true, title: judul }
  }

  const menit = Math.floor(selisih / 60_000)
  if (menit < 60) return { text: `${menit} menit lalu`, online: false, title: judul }

  const jam = Math.floor(menit / 60)
  const sekarang = new Date(now)
  if (date.toDateString() === sekarang.toDateString()) {
    return { text: `${jam} jam lalu`, online: false, title: judul }
  }

  const kemarin = new Date(now - 24 * 60 * 60_000)
  if (date.toDateString() === kemarin.toDateString()) {
    const jamMenit = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    return { text: `kemarin ${jamMenit}`, online: false, title: judul }
  }

  const hari = Math.floor(jam / 24)
  if (hari < 7) return { text: `${hari} hari lalu`, online: false, title: judul }

  return {
    text: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    online: false,
    title: judul,
  }
}

const FORM_AWAL = {
  name: '',
  email: '',
  role: 'Staff Administrasi' as Role,
  password: '',
  confirm: '',
}

export function Accounts() {
  const { session } = useSession()
  const [users, setUsers] = useState<StoredUser[]>([])
  const [now, setNow] = useState(() => Date.now())
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('semua')
  const [notice, setNotice] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(FORM_AWAL)
  const [formError, setFormError] = useState('')

  const [approveUser, setApproveUser] = useState<StoredUser | null>(null)
  const [approveRole, setApproveRole] = useState<Role>('Staff Administrasi')
  const [rejectUser, setRejectUser] = useState<StoredUser | null>(null)
  const [toggleUser, setToggleUser] = useState<StoredUser | null>(null)

  const muatUlang = useCallback(async () => {
    const data = await listUsers()
    setUsers(data)
  }, [])

  useEffect(() => {
    muatUlang()
  }, [muatUlang])

  // Daftar dan status "Online" disegarkan berkala supaya waktu aktif terakhir
  // tetap akurat selama halaman dibuka.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
      muatUlang()
    }, 30_000)
    return () => window.clearInterval(timer)
  }, [muatUlang])

  const daftar = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((user) => {
      const cocokTeks = q === '' || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
      const cocokStatus = statusFilter === 'semua' || user.status === statusFilter
      return cocokTeks && cocokStatus
    })
  }, [users, query, statusFilter])

  function bukaFormTambah() {
    setForm(FORM_AWAL)
    setFormError('')
    setNotice('')
    setFormOpen(true)
  }

  async function simpanAkunBaru() {
    if (!form.name.trim()) return setFormError('Nama wajib diisi.')
    if (!form.email.trim()) return setFormError('Email wajib diisi.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      return setFormError('Format email tidak valid. Contoh: nama@healti.id')
    }
    if (users.some((user) => user.email === form.email.trim().toLowerCase())) {
      return setFormError('Email sudah digunakan oleh akun lain.')
    }
    if (!ASSIGNABLE_ROLES.includes(form.role)) return setFormError('Peran akun wajib dipilih.')
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      return setFormError(`Password minimal ${MIN_PASSWORD_LENGTH} karakter.`)
    }
    if (form.password !== form.confirm) {
      return setFormError('Konfirmasi password tidak sama dengan password.')
    }

    const result = await createUser({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      status: 'aktif',
    })

    if (!result.ok) {
      setFormError(result.message)
      return
    }

    await muatUlang()
    setFormOpen(false)
    setNotice(`Akun ${result.user.name} dibuat dan berstatus aktif.`)
  }

  async function setujuiAkun() {
    if (!approveUser) return
    await updateUser(approveUser.id, { status: 'aktif', role: approveRole })
    await muatUlang()
    setNotice(`Akun ${approveUser.name} disetujui sebagai ${approveRole}.`)
    setApproveUser(null)
  }

  async function tolakAkun() {
    if (!rejectUser) return
    await removeUser(rejectUser.id)
    await muatUlang()
    setNotice(`Permintaan akun ${rejectUser.name} ditolak dan datanya dihapus.`)
    setRejectUser(null)
  }

  async function ubahStatus() {
    if (!toggleUser) return
    const status: AccountStatus = toggleUser.status === 'aktif' ? 'nonaktif' : 'aktif'
    await updateUser(toggleUser.id, { status })
    await muatUlang()
    setNotice(
      status === 'aktif'
        ? `Akun ${toggleUser.name} diaktifkan kembali.`
        : `Akun ${toggleUser.name} dinonaktifkan.`,
    )
    setToggleUser(null)
  }

  return (
    <>
      <PageIntro
        eyebrow="MANAJEMEN PENGGUNA"
        title="Kelola Akun"
        subtitle="Tambah, setujui, dan nonaktifkan akun tim apotek."
        action={<Button onClick={bukaFormTambah}><Plus aria-hidden="true" /> Tambah Akun</Button>}
      />

      <section className="panel">
        <div className="table-toolbar">
          <div className="search-box">
            <label className="sr-only" htmlFor="cari-akun">Cari akun berdasarkan nama atau email</label>
            <Search aria-hidden="true" />
            <input
              id="cari-akun"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama atau email akun..."
            />
          </div>

          <div className="toolbar-filter">
            <label className="toolbar-filter-label" htmlFor="filter-status-akun">Status</label>
            <select
              id="filter-status-akun"
              className="filter-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              {FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <p className="toolbar-count" role="status" aria-live="polite">
            {daftar.length} dari {users.length} akun
          </p>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {notice && <p className="inline-notice"><Check aria-hidden="true" /> {notice}</p>}
        </div>

        <DataTable label="Daftar akun pengguna">
          <thead>
            <tr>
              <th scope="col">Nama</th>
              <th scope="col">Email</th>
              <th scope="col">Peran</th>
              <th scope="col">Status</th>
              <th scope="col">Terakhir Online</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftar.length === 0 ? (
              <EmptyRow colSpan={6}>
                Tidak ada akun yang cocok dengan filter dan pencarian ini.{' '}
                <button type="button" className="link-button" onClick={() => { setQuery(''); setStatusFilter('semua') }}>
                  Reset filter
                </button>
              </EmptyRow>
            ) : daftar.map((user) => {
              const terakhir = formatLastActive(user.lastActiveAt, now)
              const akunSendiri = session ? user.id === session.id : false
              const nextStatus: AccountStatus = user.status === 'aktif' ? 'nonaktif' : 'aktif'

              return (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                    {akunSendiri && <span className="cell-note"> (akun Anda)</span>}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td><Status tone={STATUS_TONE[user.status]}>{STATUS_LABEL[user.status]}</Status></td>
                  <td>
                    <span
                      className={terakhir.online ? 'online-mark' : undefined}
                      title={terakhir.title}
                    >
                      {terakhir.online && <i aria-hidden="true" />}
                      {terakhir.text}
                    </span>
                  </td>
                  <td>
                    {user.status === 'menunggu' ? (
                      <div className="row-actions">
                        <button
                          type="button"
                          className="action-link"
                          onClick={() => { setApproveRole('Staff Administrasi'); setApproveUser(user) }}
                        >
                          <UserCheck aria-hidden="true" /> Setujui
                        </button>
                        <button
                          type="button"
                          className="action-link danger"
                          onClick={() => setRejectUser(user)}
                        >
                          <UserX aria-hidden="true" /> Tolak
                        </button>
                      </div>
                    ) : (
                      <div className="row-actions">
                        <button
                          type="button"
                          className={nextStatus === 'nonaktif' ? 'action-link danger' : 'action-link'}
                          onClick={() => setToggleUser(user)}
                          disabled={akunSendiri}
                          title={akunSendiri ? 'Anda tidak bisa menonaktifkan akun sendiri' : undefined}
                          aria-describedby={akunSendiri ? `alasan-${user.id}` : undefined}
                        >
                          {nextStatus === 'nonaktif' ? <UserX aria-hidden="true" /> : <UserCheck aria-hidden="true" />}
                          {nextStatus === 'nonaktif' ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        {akunSendiri && (
                          <span className="cell-note" id={`alasan-${user.id}`}>
                            Tidak bisa menonaktifkan akun sendiri
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </DataTable>

        <p className="panel-foot-note">
          Waktu aktif terakhir dicatat untuk keperluan keamanan dan akuntabilitas.
        </p>
      </section>

      {formOpen && (
        <Modal
          title="Tambah Akun"
          description="Akun baru langsung berstatus aktif dan bisa masuk."
          onClose={() => setFormOpen(false)}
        >
          <div className="modal-form">
            <Field label="Nama lengkap" htmlFor="akun-nama">
              <input
                id="akun-nama"
                autoFocus
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Contoh: Ratna Kumala"
              />
            </Field>

            <Field label="Email" htmlFor="akun-email">
              <input
                id="akun-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="contoh@healti.id"
              />
            </Field>

            <Field label="Peran akun" htmlFor="akun-peran">
              <select
                id="akun-peran"
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value as Role })}
              >
                {ASSIGNABLE_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </Field>

            <Field label={`Password awal (minimal ${MIN_PASSWORD_LENGTH} karakter)`} htmlFor="akun-password">
              <input
                id="akun-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </Field>

            <Field label="Konfirmasi password" htmlFor="akun-konfirmasi">
              <input
                id="akun-konfirmasi"
                type="password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={(event) => setForm({ ...form, confirm: event.target.value })}
              />
            </Field>

            <div aria-live="assertive" aria-atomic="true">
              {formError && <p className="form-error"><UserX aria-hidden="true" /> {formError}</p>}
            </div>

            <div className="modal-actions">
              <Button secondary onClick={() => setFormOpen(false)}>Batal</Button>
              <Button onClick={simpanAkunBaru}>Simpan Akun</Button>
            </div>
          </div>
        </Modal>
      )}

      {approveUser && (
        <Modal
          title="Setujui Akun"
          description={`Pilih peran untuk ${approveUser.name}. Akun langsung aktif setelah disetujui.`}
          onClose={() => setApproveUser(null)}
        >
          <div className="modal-form">
            <fieldset className="fieldset">
              <legend className="fieldset-label">Peran akun</legend>
              <div className="pilihan-grup">
                {ASSIGNABLE_ROLES.map((role) => (
                  <label key={role} className={`pilihan ${approveRole === role ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="peran-setujui"
                      value={role}
                      checked={approveRole === role}
                      onChange={() => setApproveRole(role)}
                    />
                    {role}
                  </label>
                ))}
              </div>
              <p className="fieldset-hint">Peran default: Staff Administrasi.</p>
            </fieldset>

            <div className="modal-actions">
              <Button secondary onClick={() => setApproveUser(null)}>Batal</Button>
              <Button onClick={setujuiAkun}>Setujui Akun</Button>
            </div>
          </div>
        </Modal>
      )}

      {rejectUser && (
        <Modal
          title="Tolak Permintaan Akun"
          description={`Permintaan ${rejectUser.name} akan ditolak dan datanya dihapus.`}
          onClose={() => setRejectUser(null)}
        >
          <div className="modal-form">
            <p className="modal-text">
              Tindakan ini tidak bisa dibatalkan. Akun <strong>{rejectUser.name}</strong> ({rejectUser.email}) akan dihapus dari daftar akun.
            </p>
            <div className="modal-actions">
              <Button secondary onClick={() => setRejectUser(null)}>Batal</Button>
              <Button onClick={tolakAkun}>Tolak dan Hapus</Button>
            </div>
          </div>
        </Modal>
      )}

      {toggleUser && (
        <Modal
          title={toggleUser.status === 'aktif' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
          description={
            toggleUser.status === 'aktif'
              ? `Sesi ${toggleUser.name} akan diakhiri dan tidak bisa masuk lagi.`
              : `${toggleUser.name} akan bisa masuk kembali ke aplikasi.`
          }
          onClose={() => setToggleUser(null)}
        >
          <div className="modal-form">
            <p className="modal-text">
              {toggleUser.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'} akun{' '}
              <strong>{toggleUser.name}</strong> ({toggleUser.email})?
            </p>
            <div className="modal-actions">
              <Button secondary onClick={() => setToggleUser(null)}>Batal</Button>
              <Button onClick={ubahStatus}>
                {toggleUser.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
