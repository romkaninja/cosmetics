import { useEffect, useState } from 'react'
import { api } from '../api'
import { PageHeader } from '../components/PageHeader'
import { formatDate, formatMoney, formatQuantity } from '../format'
import { btnOutline, btnPrimary, card, fieldClass } from '../ui'

export function ReportPage() {
  const [years, setYears] = useState([])
  const [year, setYear] = useState('')
  const [report, setReport] = useState(null)
  const [loadingYears, setLoadingYears] = useState(true)
  const [loadingReport, setLoadingReport] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    api('/api/reports/fulfilled-orders/years')
      .then((result) => {
        if (cancelled) return
        const list = result.data
        setYears(list)
        if (list.length > 0) {
          const latest = String(list[list.length - 1])
          setYear(latest)
          loadReport(latest, () => cancelled)
        }
      })
      .catch((error) => {
        if (!cancelled) setMessage(error.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingYears(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function loadReport(selectedYear, isCancelled = () => false) {
    setLoadingReport(true)
    setMessage('')
    api(`/api/reports/fulfilled-orders?year=${encodeURIComponent(selectedYear)}`)
      .then((result) => {
        if (!isCancelled()) setReport(result.data)
      })
      .catch((error) => {
        if (!isCancelled()) {
          setReport(null)
          setMessage(error.message)
        }
      })
      .finally(() => {
        if (!isCancelled()) setLoadingReport(false)
      })
  }

  return (
    <section>
      <PageHeader className="no-print" title="Ведомость" crumbs={[{ label: 'Ведомость' }]} />

      <div className={`${card} no-print mb-6 p-5 sm:p-6`}>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Год</span>
            <div className="relative">
              <select
                className={fieldClass(false, 'h-11 min-w-40 appearance-none pr-10')}
                value={year}
                disabled={years.length === 0}
                onChange={(event) => setYear(event.target.value)}
              >
                {years.length === 0 ? <option value="">Нет данных</option> : null}
                {years.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
              </svg>
            </div>
          </label>
          <button
            type="button"
            className={btnPrimary}
            disabled={!year || loadingReport}
            onClick={() => loadReport(year)}
          >
            {loadingReport ? 'Формирование…' : 'Сформировать'}
          </button>
          <button type="button" className={btnOutline} onClick={() => window.print()}>
            Печать
          </button>
        </div>
      </div>

      {message ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300" role="alert">{message}</p>
      ) : null}
      {loadingYears ? <p className="text-sm text-gray-500 dark:text-gray-400">Загрузка…</p> : null}
      {!loadingYears && years.length === 0 ? (
        <div className={`${card} px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400`}>
          Исполненных заказов пока нет. Укажите дату исполнения в заказах.
        </div>
      ) : null}

      {report ? <Statement report={report} loading={loadingReport} /> : null}
    </section>
  )
}

function Statement({ report, loading }) {
  const metrics = [
    { label: 'Год', value: String(report.year) },
    { label: 'Предприятия', value: String(report.groups.length) },
    { label: 'Количество', value: formatQuantity(report.totals.quantity) },
    { label: 'Стоимость', value: formatMoney(report.totals.cost) },
  ]

  return (
    <>
      <div className="no-print mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className={`${card} p-5 md:p-6`}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{metric.value}</p>
          </article>
        ))}
      </div>

      <article className={`${card} print-sheet px-5 py-6 sm:px-6 ${loading ? 'opacity-60' : ''}`}>
        <h2 className="mx-auto max-w-3xl text-center text-lg font-semibold leading-snug text-gray-800 dark:text-white/90">
          Сведения об исполненных заказах на поставку косметической продукции предприятиям торговли и сервиса за {report.year} год
        </h2>

        {report.groups.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">За выбранный год исполненных заказов нет.</p>
        ) : null}

        <div className="mt-8 space-y-8">
          {report.groups.map((group) => (
            <section key={group.enterprise_id}>
              <h3 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">Предприятие {group.enterprise_name}</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[44rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-y border-gray-200 text-left dark:border-gray-700">
                      <th className="px-3 py-3 text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">Наименование товара</th>
                      <th className="px-3 py-3 text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">Наименование бренда</th>
                      <th className="px-3 py-3 text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">Дата исполнения заказа</th>
                      <th className="px-3 py-3 text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">Количество товара в доставке</th>
                      <th className="px-3 py-3 text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">Цена, руб.</th>
                      <th className="px-3 py-3 text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">Стоимость, руб.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row, index) => (
                      <tr key={`${group.enterprise_id}-${index}`} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{row.product_name}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{row.brand_name || '—'}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{formatDate(row.delivery_date)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{row.quantity}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{formatMoney(row.price)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{formatMoney(row.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-800 dark:text-white/90">
                Итого по предприятию: {formatQuantity(group.totals.quantity)}, {formatMoney(group.totals.cost)}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-8 border-t border-gray-200 pt-4 text-base font-semibold text-gray-800 dark:border-gray-700 dark:text-white/90">
          Итого по всем предприятиям: {formatQuantity(report.totals.quantity)}, {formatMoney(report.totals.cost)}
        </p>
      </article>
    </>
  )
}
