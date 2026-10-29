import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { resources } from '../resources'

const groups = [
  {
    title: 'Отчёты',
    items: [{ to: '/report', label: 'Ведомость', icon: 'chart', end: true }],
  },
  {
    title: 'Учёт',
    items: resources.map((resource) => ({
      to: resource.path,
      label: resource.nav,
      icon: resource.key,
    })),
  },
]

function useDesktop() {
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setDesktop(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return desktop
}

export function Layout() {
  const desktop = useDesktop()
  const location = useLocation()
  const [expanded, setExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const wide = !desktop || expanded || hovered

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    function beforePrint() {
      document.documentElement.classList.remove('dark')
    }
    function afterPrint() {
      document.documentElement.classList.toggle('dark', dark)
    }
    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)
    return () => {
      window.removeEventListener('beforeprint', beforePrint)
      window.removeEventListener('afterprint', afterPrint)
    }
  }, [dark])

  function toggleSidebar() {
    if (desktop) {
      setExpanded((current) => !current)
      setHovered(false)
      return
    }
    setMobileOpen((current) => !current)
  }

  const sidebarOpen = desktop ? expanded : mobileOpen

  return (
    <div className="min-h-screen">
      {mobileOpen ? (
        <button
          type="button"
          className="no-print fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          aria-label="Закрыть меню"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`no-print fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 ${
          wide ? 'w-[290px]' : 'w-[90px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        onMouseEnter={() => {
          if (desktop && !expanded) setHovered(true)
        }}
        onMouseLeave={() => setHovered(false)}
      >
        <div className={`flex h-[76px] items-center px-5 ${wide ? '' : 'lg:justify-center lg:px-0'}`}>
          <Link to="/report" className="flex items-center gap-3">
            <LogoMark />
            <span className={`text-xl font-semibold tracking-tight text-gray-800 dark:text-white/90 ${wide ? '' : 'lg:hidden'}`}>
              Косметика
            </span>
          </Link>
        </div>

        <nav className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6" aria-label="Разделы">
          {groups.map((group) => (
            <div key={group.title} className="mb-6">
              <h2 className={`mb-4 text-xs leading-5 text-gray-400 uppercase ${wide ? '' : 'lg:sr-only'}`}>
                {group.title}
              </h2>
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      title={item.label}
                      className={({ isActive }) =>
                        `menu-item group ${isActive ? 'menu-item-active' : 'menu-item-inactive'} ${wide ? '' : 'lg:justify-center lg:px-2'}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className={isActive ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}>
                            <NavIcon name={item.icon} />
                          </span>
                          <span className={wide ? '' : 'lg:hidden'}>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className={`print-root min-h-screen transition-all duration-300 ease-in-out ${expanded || hovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'}`}>
        <header className="no-print sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:px-6">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
            aria-label={sidebarOpen ? 'Свернуть меню' : 'Открыть меню'}
            aria-expanded={sidebarOpen}
            onClick={toggleSidebar}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
              aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
              aria-pressed={dark}
              onClick={() => setDark((current) => !current)}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
            <span className="hidden h-10 w-px bg-gray-200 sm:block dark:bg-gray-800" />
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-right">
                <span className="block text-sm font-medium text-gray-800 dark:text-white/90">Администратор</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">Панель учёта</span>
              </span>
              <span className="flex size-11 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-500 dark:bg-brand-500/15">
                А
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-screen-2xl p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <rect width="32" height="32" rx="8" className="fill-brand-500" />
      <path d="M8 16.5 13.2 21 24 11" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NavIcon({ name }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'size-6',
    'aria-hidden': true,
  }

  if (name === 'chart') {
    return (
      <svg {...common}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 15v-3" />
        <path d="M12 15V8" />
        <path d="M16 15v-5" />
      </svg>
    )
  }
  if (name === 'brands') {
    return (
      <svg {...common}>
        <path d="M20.59 13.41 12.17 21a2 2 0 0 1-2.83 0L3 14.66V3h11.66l5.93 5.93a2 2 0 0 1 0 2.83Z" />
        <path d="M7.5 7.5h.01" />
      </svg>
    )
  }
  if (name === 'products') {
    return (
      <svg {...common}>
        <path d="M21 8 12 3 3 8l9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    )
  }
  if (name === 'enterprises') {
    return (
      <svg {...common}>
        <path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16" />
        <path d="M14 9h5a1 1 0 0 1 1 1v11" />
        <path d="M3 21h18" />
        <path d="M8 8h2" />
        <path d="M8 12h2" />
        <path d="M8 16h2" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M8 3h6l5 5v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v6h6" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5Z" strokeLinejoin="round" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v1.5M12 19.5V21M4.9 4.9l1.1 1.1M18 18l1.1 1.1M3 12h1.5M19.5 12H21M4.9 19.1 6 18M18 6l1.1-1.1" strokeLinecap="round" />
    </svg>
  )
}
