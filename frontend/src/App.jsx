import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CrudForm, CrudList } from './pages/CrudPages'
import { ReportPage } from './pages/ReportPage'
import { brands, enterprises, orders, products, resources } from './resources'
import { btnPrimary } from './ui'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/report" replace />} />
        <Route path="/report" element={<ReportPage />} />
        {resources.map((resource) => (
          <Route key={resource.key} path={resource.path} element={<CrudList resource={resource} />} />
        ))}
        <Route path="/brands/new" element={<CrudForm resource={brands} />} />
        <Route path="/brands/:id/edit" element={<CrudForm resource={brands} />} />
        <Route path="/products/new" element={<CrudForm resource={products} />} />
        <Route path="/products/:id/edit" element={<CrudForm resource={products} />} />
        <Route path="/enterprises/new" element={<CrudForm resource={enterprises} />} />
        <Route path="/enterprises/:id/edit" element={<CrudForm resource={enterprises} />} />
        <Route path="/orders/new" element={<CrudForm resource={orders} />} />
        <Route path="/orders/:id/edit" element={<CrudForm resource={orders} />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

function NotFound() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-6xl font-bold text-brand-500">404</p>
      <h1 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white/90">Страница не найдена</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Такой страницы в панели нет.</p>
      <Link to="/report" className={`${btnPrimary} mt-6`}>На главную</Link>
    </div>
  )
}
