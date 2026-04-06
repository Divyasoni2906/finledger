import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Filter, X } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Card, Badge, Button, Modal, Input, Select, Textarea, Toast, Spinner } from '../components/ui'
import { fmt, useToast } from '../hooks/useToast'

const EMPTY_FORM = { amount: '', type: 'income', category: '', date: '', notes: '' }

export default function Transactions() {
  const { user } = useAuth()
  const { toast, showToast, clearToast } = useToast()

  const [transactions, setTxns] = useState([])
  const [pagination, setPagination]     = useState({})
  const [loading, setLoading]           = useState(true)
  const [page, setPage]                 = useState(1)
  const [filters, setFilters]           = useState({ type: '', category: '', dateFrom: '', dateTo: '' })
  const [modalOpen, setModalOpen]       = useState(false)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [formError, setFormError]       = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [deleting, setDeleting]         = useState(null)

  const canWrite = ['admin', 'analyst'].includes(user?.role)
  const isAdmin  = user?.role === 'admin'

  const loadTxns = useCallback(async (pg = page) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: pg, limit: 15 })
      if (filters.type)     qs.set('type', filters.type)
      if (filters.category) qs.set('category', filters.category)
      if (filters.dateFrom) qs.set('dateFrom', filters.dateFrom)
      if (filters.dateTo)   qs.set('dateTo', filters.dateTo)
      const res = await api.get(`/transactions?${qs}`)
      setTxns(res.data)
      setPagination(res.pagination)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { loadTxns(page) }, [page])
  useEffect(() => { setPage(1); loadTxns(1) }, [filters])

  const handleFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }))
  const clearFilters = () => setFilters({ type: '', category: '', dateFrom: '', dateTo: '' })
  const hasFilters = Object.values(filters).some(Boolean)

  const openModal = () => {
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().split('T')[0] })
    setFormError('')
    setModalOpen(true)
  }

  const submitTxn = async () => {
    if (!form.amount || !form.category.trim()) {
      setFormError('Amount and category are required')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      await api.post('/transactions', { ...form, amount: parseFloat(form.amount) })
      showToast('Transaction added!')
      setModalOpen(false)
      loadTxns(page)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteTxn = async (id) => {
    if (!confirm('Delete this transaction?')) return
    setDeleting(id)
    try {
      await api.delete(`/transactions/${id}`)
      showToast('Transaction deleted')
      loadTxns(page)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setDeleting(null)
    }
  }

  const totalPages = pagination.totalPages || 1

  return (
    <div className="p-6 flex flex-col gap-5">
      {toast && <Toast message={toast.message} type={toast.type} onDone={clearToast} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-zinc-100">Transactions</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{pagination.total ?? '—'} total records</p>
        </div>
        {canWrite && (
          <Button variant="accent" onClick={openModal}>
            <Plus className="w-4 h-4" /> Add Transaction
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <Select value={filters.type} onChange={e => handleFilter('type', e.target.value)} className="w-36">
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <input type="text" placeholder="Category…" value={filters.category}
            onChange={e => handleFilter('category', e.target.value)}
            className="bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 w-36" />
          <input type="date" value={filters.dateFrom} onChange={e => handleFilter('dateFrom', e.target.value)}
            className="bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none transition-colors" />
          <span className="text-zinc-600 text-sm">to</span>
          <input type="date" value={filters.dateTo} onChange={e => handleFilter('dateTo', e.target.value)}
            className="bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none transition-colors" />
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-3.5 h-3.5" /> Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3.5 text-xs text-zinc-500 uppercase tracking-wider font-medium">Date</th>
                <th className="text-left px-5 py-3.5 text-xs text-zinc-500 uppercase tracking-wider font-medium">Category</th>
                <th className="text-left px-5 py-3.5 text-xs text-zinc-500 uppercase tracking-wider font-medium">Notes</th>
                <th className="text-left px-5 py-3.5 text-xs text-zinc-500 uppercase tracking-wider font-medium">Type</th>
                <th className="text-right px-5 py-3.5 text-xs text-zinc-500 uppercase tracking-wider font-medium">Amount</th>
                {isAdmin && <th className="px-5 py-3.5" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr><td colSpan={isAdmin ? 6 : 5} className="py-12 text-center">
                  <Spinner className="mx-auto" />
                </td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-sm text-zinc-600">
                  No transactions found
                </td></tr>
              ) : transactions.map(t => (
                <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-zinc-400 whitespace-nowrap">{fmt.date(t.date)}</td>
                  <td className="px-5 py-3.5 text-sm text-zinc-200 font-medium">{t.category}</td>
                  <td className="px-5 py-3.5 text-sm text-zinc-500 max-w-[200px] truncate">{t.notes || '—'}</td>
                  <td className="px-5 py-3.5"><Badge type={t.type} /></td>
                  <td className={`px-5 py-3.5 text-sm font-medium text-right whitespace-nowrap
                    ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt.currency(t.amount)}
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => deleteTxn(t.id)} disabled={deleting === t.id}
                        className="text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-40 cursor-pointer p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-800">
            <p className="text-xs text-zinc-500">
              {Math.min((page-1)*15+1, pagination.total)}–{Math.min(page*15, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 text-sm cursor-pointer disabled:cursor-not-allowed">
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i-1] > 1) acc.push('…')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) => typeof p === 'string' ? (
                  <span key={i} className="w-8 h-8 flex items-center justify-center text-zinc-600 text-sm">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors cursor-pointer
                      ${p === page ? 'bg-amber-500 text-zinc-950 border border-amber-400' : 'border border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}>
                    {p}
                  </button>
                ))
              }
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 text-sm cursor-pointer disabled:cursor-not-allowed">
                ›
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Transaction Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Transaction">
        {formError && (
          <div className="mb-4 px-3 py-2 bg-red-950/50 border border-red-900 rounded-lg text-sm text-red-400">
            {formError}
          </div>
        )}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount (₹)" type="number" min="0.01" step="0.01" placeholder="0.00"
              value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Category" placeholder="e.g. Salary"
              value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            <Input label="Date" type="date"
              value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <Textarea label="Notes (optional)" placeholder="Description…" rows={3}
            value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="flex justify-end gap-2 mt-1">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="accent" onClick={submitTxn} disabled={submitting}>
              {submitting ? 'Saving…' : 'Add Transaction'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
