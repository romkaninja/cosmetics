export async function api(path, { method = 'GET', body } = {}) {
  const response = await fetch(path, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) {
    return null
  }

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      const error = new Error('Сервер вернул некорректный ответ')
      error.errors = {}
      throw error
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Не удалось выполнить операцию')
    error.errors = data?.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)
      ? data.errors
      : {}
    throw error
  }

  return data
}
