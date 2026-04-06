import { useEffect, useState } from 'react'

// ── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl ${className}`}>
      {children}
    </div>
  )
}

// ── Badge ───────────────────────────────────────────────────────────────────
const badgeStyles = {
  income:   'bg-emerald-950 text-emerald-400 border border-emerald-900',
  expense:  'bg-red-950 text-red-400 border border-red-900',
  admin:    'bg-amber-950 text-amber-400 border border-amber-900',
  analyst:  'bg-indigo-950 text-indigo-400 border border-indigo-900',
  viewer:   'bg-zinc-800 text-zinc-400 border border-zinc-700',
  active:   'bg-emerald-950 text-emerald-400 border border-emerald-900',
  inactive: 'bg-zinc-800 text-zinc-500 border border-zinc-700',
}

export function Badge({ type }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${badgeStyles[type] || badgeStyles.viewer}`}>
      {type}
    </span>
  )
}

// ── Button ──────────────────────────────────────────────────────────────────
export function Button({ children, onClick, variant = 'default', size = 'md', disabled, className = '', type = 'button' }) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' }
  const variants = {
    default: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700',
    accent:  'bg-amber-500 hover:bg-amber-400 text-zinc-950 border border-amber-400',
    danger:  'bg-red-950 hover:bg-red-900 text-red-400 border border-red-900',
    ghost:   'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

// ── Input ───────────────────────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-zinc-500 uppercase tracking-wider">{label}</label>}
      <input
        {...props}
        className={`bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 ${error ? 'border-red-700' : ''} ${className}`}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ── Select ──────────────────────────────────────────────────────────────────
export function Select({ label, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-zinc-500 uppercase tracking-wider">{label}</label>}
      <select
        {...props}
        className={`bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none transition-colors ${className}`}
      >
        {children}
      </select>
    </div>
  )
}

// ── Textarea ────────────────────────────────────────────────────────────────
export function Textarea({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-zinc-500 uppercase tracking-wider">{label}</label>}
      <textarea
        {...props}
        className="bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none transition-colors resize-none placeholder:text-zinc-600"
      />
    </div>
  )
}

// ── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in" onClick={e => e.stopPropagation()}>
        <h2 className="font-display text-xl text-zinc-100 mb-5">{title}</h2>
        {children}
      </div>
    </div>
  )
}

// ── Toast ───────────────────────────────────────────────────────────────────
export function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className={`fixed bottom-5 right-5 z-[100] px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl animate-in
      ${type === 'success' ? 'bg-emerald-500 text-emerald-950' : 'bg-red-500 text-white'}`}>
      {message}
    </div>
  )
}

// ── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ className = '' }) {
  return (
    <div className={`w-5 h-5 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin ${className}`} />
  )
}

// ── StatCard ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, valueClass = 'text-zinc-100', delay = 0 }) {
  return (
    <Card className="p-5" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-2xl font-light tracking-tight ${valueClass}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
    </Card>
  )
}

// ── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' }
  const initials = (name || '?').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={`${sizes[size]} rounded-full bg-amber-950 border border-amber-900/50 text-amber-400 flex items-center justify-center font-medium flex-shrink-0`}>
      {initials}
    </div>
  )
}
