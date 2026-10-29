import { Link } from 'react-router-dom'

function Chevron() {
  return (
    <svg className="size-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
    </svg>
  )
}

export function PageHeader({ title, crumbs = [], className = '' }) {
  return (
    <div className={`mb-6 flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">{title}</h1>
      <nav aria-label="Навигационная цепочка">
        <ol className="flex items-center gap-1.5 text-sm">
          <li>
            <Link to="/report" className="text-gray-500 transition hover:text-brand-500 dark:text-gray-400">
              Главная
            </Link>
          </li>
          {crumbs.map((crumb) => (
            <li key={crumb.label} className="flex items-center gap-1.5">
              <Chevron />
              {crumb.to ? (
                <Link to={crumb.to} className="text-gray-500 transition hover:text-brand-500 dark:text-gray-400">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-800 dark:text-white/90">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
