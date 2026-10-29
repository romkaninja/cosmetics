import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { PageHeader } from '../components/PageHeader'
import { displayCell } from '../format'
import { btnOutline, btnPrimary, card, fieldClass } from '../ui'

export function Notice({ children }) {
  if (!children) {
    return null
  }
  return (
    <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300" role="alert">
      {children}
    </p>
  )
}

export function CrudList({ resource }) {
  return <CrudListView key={resource.key} resource={resource} />
}

function recordsLabel(count) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} запись`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} записи`
  return `${count} записей`
}

function isEmptySortValue(value) {
  return value === null || value === undefined || value === ''
}

function columnSortKind(column) {
  if (column.format === 'money' || column.key === 'quantity' || column.key.endsWith('_id')) {
    return 'number'
  }
  if (column.format === 'date') {
    return 'date'
  }
  return 'text'
}

function compareColumn(a, b, column) {
  const left = a[column.key]
  const right = b[column.key]
  const leftEmpty = isEmptySortValue(left)
  const rightEmpty = isEmptySortValue(right)
  if (leftEmpty && rightEmpty) return 0
  if (leftEmpty) return 1
  if (rightEmpty) return -1

  if (columnSortKind(column) === 'number') {
    return Number(left) - Number(right)
  }
  if (columnSortKind(column) === 'date') {
    return String(left).localeCompare(String(right))
  }
  return String(left).localeCompare(String(right), 'ru', { sensitivity: 'base', numeric: true })
}

function sortRows(rows, columns, idKey, sortKey, sortDir) {
  const column = columns.find((item) => item.key === sortKey) ?? columns.find((item) => item.key === idKey)
  const direction = sortDir === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => {
    const result = compareColumn(a, b, column)
    const hasEmpty = isEmptySortValue(a[column.key]) || isEmptySortValue(b[column.key])
    if (result !== 0) {
      return hasEmpty ? result : result * direction
    }
    return Number(a[idKey]) - Number(b[idKey])
  })
}

function CrudListView({ resource }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sortKey, setSortKey] = useState(resource.idKey)
  const [sortDir, setSortDir] = useState('asc')
  const sortedRows = useMemo(
    () => sortRows(rows, resource.columns, resource.idKey, sortKey, sortDir),
    [rows, resource, sortKey, sortDir],
  )

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir('asc')
  }

  useEffect(() => {
    let cancelled = false
    api(resource.api)
      .then((result) => {
        if (!cancelled) setRows(result.data)
      })
      .catch((error) => {
        if (!cancelled) setMessage(error.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [resource])

  async function onDelete(row) {
    if (!window.confirm(`Удалить «${resource.label(row)}»?`)) {
      return
    }
    setMessage('')
    try {
      await api(`${resource.api}/${row[resource.idKey]}`, { method: 'DELETE' })
      setRows((current) => current.filter((item) => item[resource.idKey] !== row[resource.idKey]))
    } catch (error) {
      setMessage(error.message)
    }
  }

  const countLabel = loading ? 'Загрузка…' : rows.length === 0 ? 'Записей пока нет' : recordsLabel(rows.length)

  return (
    <section>
      <PageHeader title={resource.titles.list} crumbs={[{ label: resource.titles.list }]} />
      <Notice>{message}</Notice>
      <div className={card}>
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">{countLabel}</p>
          <Link to={`${resource.path}/new`} className={btnPrimary}>Добавить</Link>
        </div>
        {loading ? <p className="px-5 py-8 text-sm text-gray-500 sm:px-6 dark:text-gray-400">Загрузка…</p> : null}
        {!loading && rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500 sm:px-6 dark:text-gray-400">Записей пока нет.</p>
        ) : null}
        {rows.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {resource.columns.map((column) => {
                    const active = sortKey === column.key
                    const nextDirection = active && sortDir === 'asc' ? 'убыванию' : 'возрастанию'
                    return (
                      <th
                        key={column.key}
                        aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                        className="px-5 py-3 font-medium whitespace-nowrap"
                      >
                        <button
                          type="button"
                          className={`inline-flex items-center gap-1.5 text-left text-xs font-medium ${active ? 'text-brand-500' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90'}`}
                          aria-label={`${column.label}: сортировать по ${nextDirection}`}
                          onClick={() => toggleSort(column.key)}
                        >
                          {column.label}
                          <span aria-hidden="true" className={active ? 'text-brand-500' : 'text-gray-300 dark:text-gray-600'}>
                            {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                          </span>
                        </button>
                      </th>
                    )
                  })}
                  <th className="px-5 py-3 text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">Действия</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr key={row[resource.idKey]} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]">
                    {resource.columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-5 py-4 align-top text-sm text-gray-700 dark:text-gray-300 ${column.key === 'description' || column.key === 'address' ? 'max-w-xs' : 'whitespace-nowrap'}`}
                      >
                        {displayCell(column, row)}
                      </td>
                    ))}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`${resource.path}/${row[resource.idKey]}/edit`}
                          className="text-sm font-medium text-brand-500 hover:text-brand-600"
                        >
                          Изменить
                        </Link>
                        <button
                          type="button"
                          className="text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400"
                          onClick={() => onDelete(row)}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function CrudForm({ resource }) {
  const { id } = useParams()
  return <CrudFormView key={`${resource.key}-${id ?? 'new'}`} resource={resource} id={id} />
}

function CrudFormView({ resource, id }) {
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [values, setValues] = useState(null)
  const [options, setOptions] = useState({})
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    const selects = resource.fields.filter((field) => field.type === 'select')

    async function load() {
      const optionEntries = await Promise.all(selects.map(async (field) => {
        const result = await api(field.source)
        return [field.name, result.data]
      }))
      const record = isEdit ? await api(`${resource.api}/${id}`) : null
      if (cancelled) return
      setOptions(Object.fromEntries(optionEntries))
      setValues(record ? resource.fromRecord(record.data) : resource.empty())
      setLoading(false)
    }

    load().catch((error) => {
      if (!cancelled) {
        setFormError(error.message)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [resource, id, isEdit])

  function onChange(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function onSubmit(event) {
    event.preventDefault()
    const nextErrors = resource.validate(values)
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    setSaving(true)
    try {
      await api(isEdit ? `${resource.api}/${id}` : resource.api, {
        method: isEdit ? 'PUT' : 'POST',
        body: resource.toPayload(values),
      })
      navigate(resource.path)
    } catch (error) {
      setErrors(error.errors || {})
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const missingRequiredList = resource.fields.find((field) => (
    field.type === 'select'
    && field.required
    && (options[field.name] || []).length === 0
  ))

  const title = isEdit ? resource.titles.edit : resource.titles.create

  return (
    <section>
      <PageHeader
        title={title}
        crumbs={[
          { label: resource.nav, to: resource.path },
          { label: isEdit ? 'Редактирование' : 'Создание' },
        ]}
      />
      <Notice>{formError}</Notice>
      {loading ? <p className="text-sm text-gray-500 dark:text-gray-400">Загрузка…</p> : null}
      {!loading && values ? (
        <form onSubmit={onSubmit} noValidate className={`${card} p-5 sm:p-6`}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {missingRequiredList ? (
              <p className="text-sm text-gray-500 md:col-span-2 dark:text-gray-400">
                Сначала добавьте записи для поля «{missingRequiredList.label}».
              </p>
            ) : null}
            {resource.fields.map((field) => (
              <label key={field.name} className={`block text-sm ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                <span className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                  {field.required ? <span className="text-red-500"> *</span> : null}
                </span>
                <Field
                  field={field}
                  value={values[field.name] ?? ''}
                  options={options[field.name] || []}
                  invalid={Boolean(errors[field.name])}
                  onChange={(value) => onChange(field.name, value)}
                />
                {errors[field.name] ? (
                  <span className="mt-1.5 block text-xs text-red-600 dark:text-red-400">{errors[field.name]}</span>
                ) : null}
              </label>
            ))}
            <div className="flex flex-wrap gap-3 pt-1 md:col-span-2">
              <button type="submit" className={btnPrimary} disabled={saving || Boolean(missingRequiredList)}>
                {saving ? 'Сохранение…' : 'Сохранить'}
              </button>
              <Link to={resource.path} className={btnOutline}>К списку</Link>
            </div>
          </div>
        </form>
      ) : null}
    </section>
  )
}

function Field({ field, value, options, invalid, onChange }) {
  if (field.type === 'textarea') {
    return (
      <textarea
        className={fieldClass(invalid, 'min-h-28 py-3')}
        rows={4}
        maxLength={field.maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <div className="relative">
        <select
          className={fieldClass(invalid, 'h-11 appearance-none pr-10')}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{field.emptyLabel || 'Выберите значение'}</option>
          {options.map((option) => (
            <option key={option[field.valueKey]} value={option[field.valueKey]}>
              {option[field.labelKey]}
            </option>
          ))}
        </select>
        <Chevron />
      </div>
    )
  }

  return (
    <input
      className={fieldClass(invalid, 'h-11')}
      type={field.type === 'date' ? 'date' : 'text'}
      inputMode={field.inputMode}
      maxLength={field.maxLength}
      placeholder={field.placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

function Chevron() {
  return (
    <svg className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
    </svg>
  )
}
