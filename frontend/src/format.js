export function formatDate(value) {
  if (!value) {
    return '—'
  }
  const [year, month, day] = String(value).split('-')
  if (!year || !month || !day) {
    return String(value)
  }
  return `${day}.${month}.${year}`
}

export function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  const number = Number(value)
  if (Number.isNaN(number)) {
    return String(value)
  }
  return `${new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number)} руб.`
}

export function formatQuantity(value) {
  return `${new Intl.NumberFormat('ru-RU').format(Number(value) || 0)} шт.`
}

export function displayCell(column, row) {
  const value = row[column.key]
  if (column.format === 'date') {
    return formatDate(value)
  }
  if (column.format === 'money') {
    return formatMoney(value)
  }
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  return String(value)
}
