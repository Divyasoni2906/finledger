import { useEffect, useState } from 'react'
import { Lock, UserPlus } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Card, Badge, Button, Modal, Input, Select, Avatar, Toast, Spinner } from '../components/ui'
import { fmt, useToast } from '../hooks/useToast'

const EMPTY_FORM = { name: '', email: '', password: '', role: 'viewer' }

export default function Users() {
  const { user } = useAuth()
  const { toast, showToast, clearToast } = useToast()
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModal]   = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [formError, setFormErr] = useState('')
  const [submitting, setSub]    = useState(false)

  const isAdmin = user?.role === 'admin'

  const load = async () => {
    setLoading(true)
    try { setUsers(await api.get('/users')) }
    catch (err) { showToast(err.message, 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { if (isAdmin) load() }, [isAdmin])

  const submit = async () => {
    if (!form.name.trim() || !form.email || !form.password) {
      setFormErr('Name, email, and password are required')
      return
    }
    setSub(true); setFormErr('')
    try {
      await api.post('/users', form)
      showToast('User created!')
      setModal(false)
      load()
    } catch (err) { setFormErr(err.message) }
    finally { setSub(false) }
  }

  if (!isAdmin) return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-zinc-600" />
        </div>
        <h2 className="text-lg font-medium text-zinc-300 mb-2">Admin only</h2>
        <p className="text-sm text-zinc-500">User management requires Admin access.</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 flex flex-col gap-5">
      {toast && <Toast message={toast.message} type={toast.type} onDone={clearToast} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-zinc-100">Users</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{users.length} registered users</p>
        </div>
        <Button variant="accent" onClick={() => { setForm(EMPTY_FORM); setFormErr(''); setModal(true) }}>
          <UserPlus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center"><Spinner className="w-8 h-8" /></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {['User','Role','Status','Created'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs text-zinc-500 uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <p className="text-sm text-zinc-200 font-medium">
                          {u.name}
                          {u.id === user?.id && <span className="ml-2 text-xs text-zinc-600">(you)</span>}
                        </p>
                        <p className="text-xs text-zinc-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><Badge type={u.role} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                      <span className="text-sm text-zinc-400 capitalize">{u.status}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-500">{fmt.date(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModal(false)} title="Create User">
        {formError && (
          <div className="mb-4 px-3 py-2 bg-red-950/50 border border-red-900 rounded-lg text-sm text-red-400">
            {formError}
          </div>
        )}
        <div className="flex flex-col gap-4">
          <Input label="Full name" placeholder="Jane Doe"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Email" type="email" placeholder="jane@example.com"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Input label="Password" type="password" placeholder="Min. 6 characters"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          <Select label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="viewer">Viewer — Read only</option>
            <option value="analyst">Analyst — Read + create</option>
            <option value="admin">Admin — Full access</option>
          </Select>
          <div className="flex justify-end gap-2 mt-1">
            <Button variant="default" onClick={() => setModal(false)}>Cancel</Button>
            <Button variant="accent" onClick={submit} disabled={submitting}>
              {submitting ? 'Creating…' : 'Create User'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
