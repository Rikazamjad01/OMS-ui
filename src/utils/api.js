import axios from 'axios'

const baseUrl = 'https://ecommerce-platform-backend-production.up.railway.app/api/v1'

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ✅ Generic GET with optional params
export const getRequest = async (endpoint, params = {}) => {
  try {
    const response = await api.get(endpoint, { params })

    return response.data
  } catch (error) {
    console.error(`Failed to GET ${endpoint}:`, error)
    throw error
  }
}

// ✅ Generic POST
export const postRequest = async (endpoint, body = {}) => {
  try {
    const response = await api.post(endpoint, body)

    return response.data
  } catch (error) {
    console.error(`Failed to POST ${endpoint}:`, error)
    throw error
  }
}

// ✅ Customers API (with filters, pagination, search, etc.)
export const getCustomers = async (params = {}) => {
  return getRequest('customers', params)
}

// ✅ Merge two orders
export const mergeOrders = async orderIds => {
  if (orderIds.length !== 2) {
    throw new Error('Merge requires exactly 2 orders')
  }

  return postRequest('orders/merge_order', {
    order1Id: orderIds[0],
    order2Id: orderIds[1]
  })
}

// ✅ Duplicate one order
export const duplicateOrders = async orderIds => {
  if (orderIds.length !== 1) {
    throw new Error('Duplicate requires exactly 1 order')
  }

  return postRequest('orders/duplicate', {
    orderId: orderIds[0]
  })
}
