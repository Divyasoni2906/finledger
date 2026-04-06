import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Hash } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Card, StatCard, Badge, Spinner } from '../components/ui'
import { fmt } from '../hooks/useToast'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {fmt.currency(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary]   = useState(null)
  const [recent, setRecent]     = useState([])
  const [trends, setTrends]     = useState([])
  const [categories, setCats]   = useState([])
  const [loading, setLoading]   = useState(true)

  const canSeeAnalytics = user?.role !== 'viewer'

  useEffect(() => {
    const loadAll = async () => {
      try {
        const calls = [
          api.get('/dashboard/summary'),
          api.get('/dashboard/recent?limit=8'),
        ]
        if (canSeeAnalytics) {
          calls.push(api.get(`/dashboard/trends/monthly?year=${new Date().getFullYear()}`))
          calls.push(api.get('/dashboard/categories'))
        }
        const [sum, rec, tr, cats] = await Promise.all(calls)
        setSummary(sum)
        setRecent(rec)
        if (tr)   setTrends(tr.map(t => ({ ...t, month: t.month?.slice(5) })))
        if (cats) setCats(cats.filter(c => c.expense > 0).sort((a,b) => b.expense - a.expense).slice(0,5))
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Spinner className="w-8 h-8" />
    </div>
  )

  const maxCat = Math.max(...categories.map(c => c.expense), 1)

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Income" value={fmt.currency(summary?.totalIncome)} sub="All time"
          valueClass="text-emerald-400" delay={0} />
        <StatCard label="Total Expenses" value={fmt.currency(summary?.totalExpenses)} sub="All time"
          valueClass="text-red-400" delay={50} />
        <StatCard label="Net Balance" value={fmt.currency(summary?.netBalance)} sub="Income − Expenses"
          valueClass="text-amber-400" delay={100} />
        <StatCard label="Transactions" value={summary?.transactionCount ?? '—'} sub="Total records"
          delay={150} />
      </div>

      {/* Charts row */}
      {canSeeAnalytics && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Trend chart */}
          <Card className="xl:col-span-2 p-5">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Monthly Trends — {new Date().getFullYear()}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" tick={{ fill:'#71717a', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#71717a', fontSize:11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => '₹'+Math.round(v/1000)+'k'} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="url(#income)" />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#expense)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Top categories */}
          <Card className="p-5">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Top Expenses</h3>
            <div className="flex flex-col gap-3.5">
              {categories.map(cat => (
                <div key={cat.category}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-sm text-zinc-300">{cat.category}</span>
                    <span className="text-xs text-zinc-500">{fmt.currency(cat.expense)}</span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full transition-all duration-700"
                      style={{ width: `${(cat.expense / maxCat * 100).toFixed(1)}%` }} />
                  </div>
                </div>
              ))}
              {!categories.length && <p className="text-sm text-zinc-600">No expense data</p>}
            </div>
          </Card>
        </div>
      )}

      {/* Recent transactions */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-300">Recent Activity</h3>
        </div>
        <div className="divide-y divide-zinc-800/60">
          {recent.length === 0 && (
            <p className="text-sm text-zinc-600 text-center py-10">No transactions yet</p>
          )}
          {recent.map(t => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/40 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                ${t.type === 'income' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 font-medium">{t.category}</p>
                <p className="text-xs text-zinc-500 truncate">{t.notes || fmt.date(t.date)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-medium ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt.currency(t.amount)}
                </p>
                <p className="text-xs text-zinc-600">{fmt.shortDate(t.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
