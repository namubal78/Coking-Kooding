'use client'

import { useEffect } from 'react'

interface HelpModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function HelpModal({ title, onClose, children }: HelpModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-gray-900 rounded-t-2xl">
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1 rounded-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 text-sm text-gray-300 space-y-4 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

export function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); onClick() }}
      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-700 hover:bg-indigo-600 text-white text-[11px] font-bold transition-colors cursor-pointer shrink-0 leading-none"
      title="구현 상세 보기"
    >
      !
    </button>
  )
}

interface HelpSectionProps {
  label: string
  items: string[]
}

export function HelpSection({ label, items }: HelpSectionProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">{label}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-indigo-500 shrink-0 mt-0.5">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
