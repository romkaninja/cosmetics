export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60'

export const btnOutline =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-theme-xs ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-white/5'

export const card =
  'rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]'

export function fieldClass(invalid, extra = '') {
  return [
    'w-full rounded-lg border bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',
    invalid
      ? 'border-red-400 focus:border-red-400 focus:shadow-focus-error'
      : 'border-gray-300 focus:border-brand-300 focus:shadow-focus-ring dark:border-gray-700 dark:focus:border-brand-800',
    extra,
  ].join(' ')
}
