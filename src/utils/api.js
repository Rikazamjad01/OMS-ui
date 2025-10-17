import axios from 'axios'
import Cookies from 'js-cookie'

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Generic GET with optional params

const getHeaders = () => {
  const tokens = Cookies.get('token')
  const token = JSON.parse(tokens || '{}')?.accessToken

  // const token =
  //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGM4MmI4ZjZhNDg1MTg3NTJkMDg4MmYiLCJqdGkiOiI3OTU0Nzg4Y2FiZDU5MjgzNWI3MGU5ODE1ZDRiYzg0ZDkwNGUzMDM0ZjM3ZWI1OTlhYjg4YTQ2YzIwYjcxY2IzIiwiaWF0IjoxNzU4MTAzOTkxLCJleHAiOjE3NjU4Nzk5OTF9.ut51S-UVfkpvl_9pw58GDy-gOcKW-CA3dqPOWMpemMA'

  // console.log("Token from cookies:", token);
  const headers = {
    authorization: ''
  }

  if (token) {
    headers.authorization = `${token}`
  }

  return headers
}

const handleError = error => {
  console.log(error, 'error..........')

  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message || error.response?.data?.message || error.message || 'Something went wrong.'

    console.error('Axios Error:', message, error.response?.data)
    throw new Error(message) // Still throw for catching
  } else {
    console.error('Unexpected Error:', error)
    throw new Error('Unexpected error occurred.')
  }
}

export const getRequest = async endPoint => {
  try {
    const headers = getHeaders()
    const response = await axios.get(baseUrl + endPoint, { headers })

    if (response.status === 401) {
      Cookies.remove('token')
      Cookies.remove('username')
      Cookies.remove('role')
      Cookies.remove('email')
      Cookies.remove('user')
    }

    console.log(endPoint, 'response', response)

    if (response.status >= 200 && response.status < 300) {
      // console.log(response.data);
      return response.data
    }

    // throw new Error(`HTTP Error ${response.status}: ${response.statusText}`)
  } catch (error) {
    handleError(error)

    throw error
  }
}

export const postRequest = async (endPoint, data, method = 'post') => {
  try {
    let response
    const headers = getHeaders()

    // Check if data is FormData and set appropriate headers
    if (data instanceof FormData) {
      // Don't set Content-Type for FormData, let the browser set it with boundary
      delete headers['Content-Type']
    }

    if (method === 'delete') {
      response = await axios.delete(`${baseUrl}${endPoint}`, {
        headers: headers,
        data: data
      })
    } else {
      response = await axios[method](`${baseUrl}${endPoint}`, data, {
        headers: headers
      })
    }

    if (response.status >= 200 && response.status < 300) {
      console.log('post request whole response.', response)

      return response.data
    } else {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    handleError(error)
    throw error
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
  return postRequest('orders/merge_order', {
    order1Id: orderIds[0],
    order2Id: orderIds[1],
    orderIds: orderIds
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
      quantity: item.splitQuantity,
      variant_id: item?.prodVarientId
    }))
  })
}

export const apiRequest = async (url, options = {}) => {
  const { method = 'GET', data, headers = {}, ...rest } = options

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',

      // Add your default headers here
      ...headers,
      ...getHeaders()
    },
    ...rest
  }

  if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    config.body = JSON.stringify(data)
  }

  const response = await fetch(`${baseUrl}${url}`, config)

  return response.json()
}
