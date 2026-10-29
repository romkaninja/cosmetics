import { validateBrand, validateEnterprise, validateOrder, validateProduct } from './validation'

export const brands = {
  key: 'brands',
  path: '/brands',
  api: '/api/brands',
  idKey: 'brand_id',
  nav: 'Бренды',
  titles: {
    list: 'Бренды',
    create: 'Новый бренд',
    edit: 'Редактирование бренда',
  },
  label: (row) => row.name,
  columns: [
    { key: 'brand_id', label: '№' },
    { key: 'name', label: 'Название' },
    { key: 'description', label: 'Описание' },
  ],
  fields: [
    { name: 'name', label: 'Название', required: true, maxLength: 100 },
    { name: 'description', label: 'Описание', type: 'textarea', maxLength: 5000 },
  ],
  empty: () => ({ name: '', description: '' }),
  fromRecord: (record) => ({
    name: record.name ?? '',
    description: record.description ?? '',
  }),
  toPayload: (values) => ({
    name: values.name.trim(),
    description: values.description.trim(),
  }),
  validate: validateBrand,
}

export const products = {
  key: 'products',
  path: '/products',
  api: '/api/products',
  idKey: 'product_id',
  nav: 'Товары',
  titles: {
    list: 'Товары',
    create: 'Новый товар',
    edit: 'Редактирование товара',
  },
  label: (row) => row.name,
  columns: [
    { key: 'product_id', label: '№' },
    { key: 'name', label: 'Наименование' },
    { key: 'brand_name', label: 'Бренд' },
    { key: 'price', label: 'Цена', format: 'money' },
    { key: 'description', label: 'Описание' },
  ],
  fields: [
    { name: 'name', label: 'Наименование', required: true, maxLength: 100 },
    { name: 'description', label: 'Описание', type: 'textarea', maxLength: 5000 },
    { name: 'price', label: 'Цена, руб.', inputMode: 'decimal', placeholder: '0,00' },
    {
      name: 'brand_id',
      label: 'Бренд',
      type: 'select',
      emptyLabel: 'Без бренда',
      source: '/api/brands',
      valueKey: 'brand_id',
      labelKey: 'name',
    },
  ],
  empty: () => ({ name: '', description: '', price: '', brand_id: '' }),
  fromRecord: (record) => ({
    name: record.name ?? '',
    description: record.description ?? '',
    price: record.price ?? '',
    brand_id: record.brand_id == null ? '' : String(record.brand_id),
  }),
  toPayload: (values) => ({
    name: values.name.trim(),
    description: values.description.trim(),
    price: values.price.trim().replace(',', '.'),
    brand_id: values.brand_id === '' ? null : Number(values.brand_id),
  }),
  validate: validateProduct,
}

export const enterprises = {
  key: 'enterprises',
  path: '/enterprises',
  api: '/api/enterprises',
  idKey: 'enterprise_id',
  nav: 'Предприятия',
  titles: {
    list: 'Предприятия',
    create: 'Новое предприятие',
    edit: 'Редактирование предприятия',
  },
  label: (row) => row.name,
  columns: [
    { key: 'enterprise_id', label: '№' },
    { key: 'name', label: 'Наименование' },
    { key: 'phone', label: 'Телефон' },
    { key: 'address', label: 'Адрес' },
  ],
  fields: [
    { name: 'name', label: 'Наименование', required: true, maxLength: 150 },
    { name: 'phone', label: 'Телефон', maxLength: 20, placeholder: '+7 (495) 000-00-00' },
    { name: 'address', label: 'Адрес', maxLength: 255 },
  ],
  empty: () => ({ name: '', phone: '', address: '' }),
  fromRecord: (record) => ({
    name: record.name ?? '',
    phone: record.phone ?? '',
    address: record.address ?? '',
  }),
  toPayload: (values) => ({
    name: values.name.trim(),
    phone: values.phone.trim(),
    address: values.address.trim(),
  }),
  validate: validateEnterprise,
}

export const orders = {
  key: 'orders',
  path: '/orders',
  api: '/api/orders',
  idKey: 'order_id',
  nav: 'Заказы',
  titles: {
    list: 'Заказы',
    create: 'Новый заказ',
    edit: 'Редактирование заказа',
  },
  label: (row) => `${row.product_name}, ${row.enterprise_name}`,
  columns: [
    { key: 'order_id', label: '№' },
    { key: 'order_date', label: 'Дата заказа', format: 'date' },
    { key: 'product_name', label: 'Товар' },
    { key: 'enterprise_name', label: 'Предприятие' },
    { key: 'quantity', label: 'Количество' },
    { key: 'delivery_date', label: 'Дата исполнения', format: 'date' },
  ],
  fields: [
    {
      name: 'product_id',
      label: 'Товар',
      type: 'select',
      required: true,
      emptyLabel: 'Выберите товар',
      source: '/api/products',
      valueKey: 'product_id',
      labelKey: 'name',
    },
    {
      name: 'enterprise_id',
      label: 'Предприятие',
      type: 'select',
      required: true,
      emptyLabel: 'Выберите предприятие',
      source: '/api/enterprises',
      valueKey: 'enterprise_id',
      labelKey: 'name',
    },
    { name: 'quantity', label: 'Количество', required: true, inputMode: 'numeric' },
    { name: 'order_date', label: 'Дата заказа', type: 'date' },
    { name: 'delivery_date', label: 'Дата исполнения', type: 'date' },
  ],
  empty: () => ({
    product_id: '',
    enterprise_id: '',
    quantity: '',
    order_date: '',
    delivery_date: '',
  }),
  fromRecord: (record) => ({
    product_id: record.product_id == null ? '' : String(record.product_id),
    enterprise_id: record.enterprise_id == null ? '' : String(record.enterprise_id),
    quantity: record.quantity == null ? '' : String(record.quantity),
    order_date: record.order_date ?? '',
    delivery_date: record.delivery_date ?? '',
  }),
  toPayload: (values) => ({
    product_id: Number(values.product_id),
    enterprise_id: Number(values.enterprise_id),
    quantity: Number(values.quantity),
    order_date: values.order_date || null,
    delivery_date: values.delivery_date || null,
  }),
  validate: validateOrder,
}

export const resources = [brands, products, enterprises, orders]
