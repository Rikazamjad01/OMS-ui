import axios from 'axios'

const baseUrl =

  'https://ecommerce-platform-backend-production.up.railway.app/api/v1'

  // 'http://192.168.18.203:4000/api/v1'

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Generic GET with optional params
export const getRequest = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${baseUrl}/${endpoint}`, { params })

    return response.data
  } catch (error) {
    console.error(`Failed to GET ${endpoint}:`, error)
    throw error
  }
}

// Generic POST
export const postRequest = async (endpoint, body = {}) => {
  console.log(body, 'body in postRequest')

  try {
    const response = await api.post(endpoint, body)

    return response.data
  } catch (error) {
    const apiMessage = error?.response?.data?.message || error.message || 'Unknown error'

    console.error(`Failed to POST ${endpoint}:`, apiMessage)

    // throw a clean string instead of whole error object
    throw new Error(apiMessage)
  }
}

// Customers API (with filters, pagination, search, etc.)
export const getCustomers = async (params = {}) => {
  return getRequest('customers', params)
}

export const getProducts = async (params = {}) => {
  return getRequest('products', params)
}

// Merge two orders
export const mergeOrders = async orderIds => {
  if (orderIds.length !== 2) {
    throw new Error('Merge requires exactly 2 orders')
  }

  return postRequest('orders/merge_order', {
    order1Id: orderIds[0],
    order2Id: orderIds[1]
  })
}

// split an order into two, based on selected product IDs
export const splitOrder = async (orderId, selectedLineItems) => {
  if (!orderId) {
    throw new Error('Order ID is required for splitting')
  }

  if (!selectedLineItems || selectedLineItems.length < 1) {
    throw new Error('At least one product must be selected for splitting')
  }

  console.log(orderId, 'orderId in splitOrder')

  return postRequest('orders/split_order', {
    id: orderId,
    line_items: selectedLineItems.map(item => ({
      id: item.id,
      quantity: item.splitQuantity
    }))
  })
}
