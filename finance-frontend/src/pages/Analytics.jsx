import { useEffect, useState } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import { Lock } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Card, Select, Spinner } from '../components/ui'
import { fmt } from '../hooks/useToast'

const COLORS = ['#f59e0b','#10b981','#ef4444','#818cf8','#fb923c','#22d3ee','#f472b6','#a3e635','#60a5fa']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1.5 font-medium">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-medium" style={{ color: p.fill || p.color }}>
          {p.name}: {fmt.currency(p.value)}
        </p>
      ))}
    </div>
  )
}

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-medium" style={{ color: d.payload.fill }}>{d.name}</p>
      <p className="text-zinc-300">{fmt.currency(d.value)}</p>
      <p className="text-zinc-500">{d.payload.percent?.toFixed(1)}%</p>
    </div>
  )
}

export default function Analytics() {
  const { user } = useAuth()
  const [year, setYear]           = useState(String(new Date().getFullYear()))
  const [monthly, setMonthly]     = useState([])
  const [categories, setCats]     = useState([])
  const [loading, setLoading]     = useState(true)

  const canView = ['analyst', 'admin'].includes(user?.role)

  useEffect(() => {
    if (!canView) return
    const load = async () => {
      setLoading(true)
      try {
        const [tr, cats] = await Promise.all([
          api.get(`/dashboard/trends/monthly?year=${year}`),
          api.get('/dashboard/categories'),
        ])
        setMonthly(tr.map(t => ({ ...t, month: t.month?.slice(5) })))
        setCats(cats)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [year, canView])

  if (!canView) return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-zinc-600" />
        </div>
        <h2 className="text-lg font-medium text-zinc-300 mb-2">Analytics restricted</h2>
        <p className="text-sm text-zinc-500">This section requires Analyst or Admin access.</p>
      </div>
    </div>
  )

  const expenseData = categories.filter(c => c.expense > 0).map((c, i) => ({
    ...c, fill: COLORS[i % COLORS.length],
    percent: c.expense / categories.reduce((s, x) => s + x.expense, 0) * 100
  }))
  const incomeData = categories.filter(c => c.income > 0).map((c, i) => ({
    ...c, fill: COLORS[i % COLORS.length],
    percent: c.income / categories.reduce((s, x) => s + x.income, 0) * 100
  }))

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-zinc-100">Analytics</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Trends and category breakdown</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <>
          {/* Monthly bar chart */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-medium text-zinc-300">Monthly Income vs Expenses</h3>
              <select value={year} onChange={e => setYear(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-1.5 text-sm text-zinc-200 outline-none">
                {[2026,2025,2024,2023,2022].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" tick={{ fill:'#71717a', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#71717a', fontSize:11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => '₹'+Math.round(v/1000)+'k'} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend formatter={v => <span style={{color:'#a1a1aa', fontSize:12}}>{v}</span>} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4,4,0,0]} maxBarSize={28} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4,4,0,0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Pie charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-medium text-zinc-300 mb-5">Expense by Category</h3>
              {expenseData.length ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={expenseData} dataKey="expense" nameKey="category" cx="50%" cy="50%"
                      outerRadius={90} innerRadius={50} paddingAngle={2} label={({ name, percent }) => `${name} ${percent?.toFixed(0)}%`}
                      labelLine={false}>
                      {expenseData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-zinc-600 text-center py-10">No expense data</p>}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-zinc-300 mb-5">Income by Category</h3>
              {incomeData.length ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={incomeData} dataKey="income" nameKey="category" cx="50%" cy="50%"
                      outerRadius={90} innerRadius={50} paddingAngle={2}
                      label={({ name, percent }) => `${name} ${percent?.toFixed(0)}%`} labelLine={false}>
                      {incomeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-zinc-600 text-center py-10">No income data</p>}
            </Card>
          </div>

          {/* Category table */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-300">Category Summary</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Category','Income','Expense','Net'].map(h => (
                    <th key={h} className={`px-5 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium
                      ${h === 'Category' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {categories.map(c => (
                  <tr key={c.category} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-zinc-200 font-medium">{c.category}</td>
                    <td className="px-5 py-3 text-sm text-emerald-400 text-right">{fmt.currency(c.income)}</td>
                    <td className="px-5 py-3 text-sm text-red-400 text-right">{fmt.currency(c.expense)}</td>
                    <td className={`px-5 py-3 text-sm font-medium text-right ${c.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {c.net >= 0 ? '+' : ''}{fmt.currency(c.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}
