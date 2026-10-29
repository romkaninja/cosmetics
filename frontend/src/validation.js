function characterCount(value) {
  return [...String(value ?? '')].length
}

export function validateRequiredName(value, emptyMessage, max) {
  const text = String(value ?? '').trim()
  if (!text) {
    return emptyMessage
  }
  if (characterCount(text) > max) {
    return `Не длиннее ${max} символов`
  }
  return null
}

export function validateOptionalText(value, max) {
  const text = String(value ?? '').trim()
  if (characterCount(text) > max) {
    return `Не длиннее ${max} символов`
  }
  return null
}

export function validatePrice(value) {
  const text = String(value ?? '').trim().replace(',', '.')
  if (text === '') {
    return null
  }
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(text)) {
    return 'Укажите цену числом не меньше нуля, не больше двух знаков после запятой и не больше 99999999.99'
  }
  const [whole, fraction = ''] = text.split('.')
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  if (cents > 9999999999) {
    return 'Укажите цену числом не меньше нуля, не больше двух знаков после запятой и не больше 99999999.99'
  }
  return null
}

export function validatePhone(value) {
  const text = String(value ?? '').trim()
  if (text === '') {
    return null
  }
  if (characterCount(text) > 20 || !/^[0-9+\-()\s]{5,20}$/.test(text)) {
    return 'Телефон: от 5 до 20 символов, цифры, пробел, +, скобки и дефис'
  }
  return null
}

export function validateBrand(values) {
  const errors = {}
  const nameError = validateRequiredName(values.name, 'Укажите название бренда', 100)
  if (nameError) errors.name = nameError
  const descriptionError = validateOptionalText(values.description, 5000)
  if (descriptionError) errors.description = descriptionError
  return errors
}

export function validateProduct(values) {
  const errors = {}
  const nameError = validateRequiredName(values.name, 'Укажите наименование товара', 100)
  if (nameError) errors.name = nameError
  const descriptionError = validateOptionalText(values.description, 5000)
  if (descriptionError) errors.description = descriptionError
  const priceError = validatePrice(values.price)
  if (priceError) errors.price = priceError
  return errors
}

export function validateEnterprise(values) {
  const errors = {}
  const nameError = validateRequiredName(values.name, 'Укажите наименование предприятия', 150)
  if (nameError) errors.name = nameError
  const phoneError = validatePhone(values.phone)
  if (phoneError) errors.phone = phoneError
  const addressError = validateOptionalText(values.address, 255)
  if (addressError) errors.address = addressError
  return errors
}

export function validateOrder(values) {
  const errors = {}
  if (!values.product_id) errors.product_id = 'Выберите товар'
  if (!values.enterprise_id) errors.enterprise_id = 'Выберите предприятие'

  const quantity = String(values.quantity ?? '').trim()
  if (!/^\d+$/.test(quantity) || Number(quantity) < 1 || Number(quantity) > 1000000) {
    errors.quantity = 'Количество должно быть целым числом от 1 до 1000000'
  }

  if (values.order_date && values.delivery_date && values.delivery_date < values.order_date) {
    errors.delivery_date = 'Дата исполнения не может быть раньше даты заказа'
  }

  return errors
}
