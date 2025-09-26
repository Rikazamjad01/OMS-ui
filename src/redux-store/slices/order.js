import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'

import { getRequest, postRequest, apiRequest } from '@/utils/api'

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ page = 1, limit = 25, search = '', filters = {}, force = false }, { rejectWithValue, getState }) => {
    try {
      // Check if we already have the data to avoid redundant fetches
      const state = getState()
      const currentData = state.orders.orders

      // If we're fetching the same page with same filters, skip
      if (
        !force &&
        currentData.length > 0 &&
        state.orders.pagination.currentPage === page &&
        JSON.stringify(state.orders.lastFilters) === JSON.stringify(filters)
      ) {
        return null // Indicate no fetch needed
      }

      const filterParams = {}

      if (filters.amountMin) filterParams.min_total = filters.amountMin
      if (filters.amountMax) filterParams.max_total = filters.amountMax
      if (filters.dateFrom) filterParams.start_date = filters.dateFrom
      if (filters.dateTo) filterParams.end_date = filters.dateTo
      if (filters.status) filterParams.orderStatus = filters.status
      if (filters.platform) filterParams.platform = filters.platform
      if (filters.customer) filterParams.search = filters.customer
      if (filters.order) filterParams.search = filters.order
      if (filters.paymentMethod) filterParams.payment_method_names = filters.paymentMethod
      if (filters.paymentStatus) filterParams.financial_status = filters.paymentStatus
      if (filters.city) filterParams.city = filters.city

      // if (filters.paymentMethods) filterParams.payment_gateway_names = filters.paymentMethods.join(',')

      // if (filters.order) filterParams.

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...filterParams
      })

      const response = await getRequest(`orders/history?${params}`)

      if (!response.status) {
        return rejectWithValue(response.message)
      }

      const data = response.data || {}

      const ordersWithArrays = data.orders.map(order => ({
        ...order,
        comments:
          typeof order.comments === 'string'
            ? order.comments.split('\n').filter(c => c.trim() !== '')
            : order.comments || [],
        remarks:
          typeof order.remarks === 'string'
            ? order.remarks.split('\n').filter(r => r.trim() !== '')
            : order.remarks || []
      }))

      return {
        orders: ordersWithArrays || [],
        total: data.pagination?.total || 0,
        page: data.pagination?.page || page,
        limit: data.pagination?.limit || limit,
        orderStats: data.pagination,
        filters // Store the filters used for this request
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateOrderCommentsAndRemarks = createAsyncThunk(
  'orders/updateCommentsAndRemarks',
  async ({ orderId, comments, remarks, tags }, { rejectWithValue, getState }) => {
    try {
      const state = getState()
      const order = selectOrderById(state, orderId)

      const normalizeToString = val => {
        if (Array.isArray(val)) return val.join('\n') // or ', ', depends on how you want it combined

        return val ?? '' // null/undefined → ''
      }

      // Use the correct endpoint and format from your Postman example
      const response = await postRequest(`orders/add`, {
        id: orderId,
        ...(tags !== undefined ? { tags: Array.isArray(tags) ? tags.join(', ') : tags } : {}),
        ...(remarks !== undefined ? { remarks: normalizeToString(remarks) } : {}),
        ...(comments !== undefined ? { comments: normalizeToString(comments) } : {})
      })

      if (!response.status) {
        return rejectWithValue(response.message)
      }

      // Return the updated order data
      // return {
      //   orderId,
      //   comments: response.data?.comments || '',
      //   remarks: response.data?.remarks || '',
      //   tags: response.data?.tags || '',
      //   status: response?.status
      // }
      return response.data?.comments || ''
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchOrderById = createAsyncThunk('orders/fetchOrderById', async (orderId, { rejectWithValue }) => {
  try {
    const response = await getRequest(`orders/${orderId}`)

    if (!response.status) {
      return rejectWithValue(response.message)
    }

    const order = response.data || {}

    return order
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateOrdersStatusThunk = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderIds, status }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`orders/status/${status}`, {
        method: 'PATCH',
        data: {
          id: orderIds || []
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.status) {
        return rejectWithValue(response.message)
      }

      return {
        orderIds,
        status: response.status,
        message: response.message
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateOrderProducts = createAsyncThunk(
  'orders/updateOrderProducts',
  async ({ orderId, products }, { rejectWithValue }) => {
    try {
      const line_items = products.map(p => ({
        id: p.id,
        quantity: p.quantity || 1,
        variant_id: p.variant?.id || p.id
      }))

      console.log(line_items, 'line_items')

      const response = await apiRequest('orders', {
        method: 'PATCH',
        data: { id: orderId, line_items },
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.status) {
        return rejectWithValue(response.message)
      }

      return { orderId, updatedOrder: response.data }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await postRequest('orders', orderData) // POST /orders

      if (!response.status) {
        return rejectWithValue(response.message)
      }

      return response.data // backend should return the created order
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    loading: false,
    error: null,
    selectedOrders: null,
    selectedCustomer: null,
    lastFilters: {}, // Store last used filters
    pagination: {
      currentPage: 1,
      itemsPerPage: 25,
      total: 0
    },
    selectedProductIds: [],
    orderStats: {}
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload
    },
    handleOrder: (state, action) => {
      state.orders = action.payload.orders || []
      state.pagination = action.payload.pagination
    },
    handleFindOrder: (state, action) => {
      // console.log(state.orders, action.payload, 'state.orders and action.payload in handleFindOrder');
      const order = state.orders.find(order => order.id == action.payload)

      if (order) {
        state.selectedOrders = order
      }
    },
    handleFindCustomer: (state, action) => {
      const customerId = action.payload

      const orderWithCustomer = state.orders.find(order => order.customerData?.id == customerId)

      state.selectedCustomer = orderWithCustomer ? orderWithCustomer.customerData : null
    },
    setItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload
    },
    clearError: state => {
      state.error = null
    },
    clearSelectedCustomer: state => {
      state.selectedCustomer = null
    },

    setSelectedProducts: (state, action) => {
      if (action.payload) {
        state.selectedProductIds = action.payload
      } else {
        state.selectedProductIds = []
      }
    },

    splitOrderProductSetting: (state, action) => {
      state.selectedOrders.products = action.payload?.data?.products
      state.selectedOrders.line_items = action.payload?.data?.line_items
    },

    // Add a reset action to clear state when needed
    resetOrders: state => {
      state.orders = []
      state.selectedOrders = null
      state.selectedCustomer = null
      state.pagination = {
        currentPage: 1,
        itemsPerPage: 25,
        total: 0
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchOrders.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false

        if (action.payload) {
          state.orders = action.payload.orders
          state.pagination = {
            currentPage: action.meta.arg.page, // Use the requested page, not backend response
            itemsPerPage: action.meta.arg.limit, // Use the requested limit
            total: action.payload.total // Backend should return correct total
          }
          state.lastFilters = action.payload.filters || {}
          state.orderStats = action.payload.orderStats
        }
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateOrderCommentsAndRemarks.fulfilled, (state, action) => {
        // state.selectedOrders.comments = action.payload

        const { orderId, comments, remarks, tags } = action.payload
        const orderIndex = state.orders.findIndex(order => order.id === orderId)

        if (orderIndex !== -1) {
          const existingOrder = state.orders[orderIndex]

          const updatedOrder = {
            ...existingOrder,
            comments: [
              ...(existingOrder.comments || []),
              ...(typeof comments === 'string' ? comments.split('\n').filter(c => c.trim()) : comments || [])
            ],
            remarks: [
              ...(existingOrder.remarks || []),
              ...(typeof remarks === 'string' ? remarks.split('\n').filter(r => r.trim()) : remarks || [])
            ],
            tags: Array.isArray(tags) ? tags.join(', ') : tags || existingOrder.tags || ''
          }

          state.orders[orderIndex] = updatedOrder

          if (state.selectedOrders?.id === orderId) {
            state.selectedOrders = updatedOrder
          }
        }
      })
      .addCase(fetchOrderById.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedOrders = action.payload // store fetched order details
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateOrdersStatusThunk.pending, state => {
        // state.loading = false
        state.error = null
      })
      .addCase(updateOrdersStatusThunk.fulfilled, (state, action) => {
        state.loading = false
        const { orderIds, status } = action.payload

        state.orders = state.orders.map(order =>
          orderIds.map(String).includes(String(order.id)) ? { ...order, status } : order
        )

        if (state.selectedOrders && orderIds.map(String).includes(String(state.selectedOrders.id))) {
          state.selectedOrders = { ...state.selectedOrders, status }
        }
      })
      .addCase(updateOrdersStatusThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })
      .addCase(updateOrderProducts.pending, state => {
        // state.loading = true
        state.error = null
      })
      .addCase(updateOrderProducts.fulfilled, (state, action) => {
        state.loading = false
        const { orderId, updatedOrder } = action.payload

        // Update the main orders array
        const index = state.orders.findIndex(o => o.id === orderId)

        if (index !== -1) {
          state.orders[index] = updatedOrder
        }

        // Update selectedOrders if open
        if (state.selectedOrders?.id === orderId) {
          state.selectedOrders = updatedOrder
        }
      })
      .addCase(updateOrderProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })
      .addCase(createOrder.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        const newOrder = action.payload

        // add new order at the top
        state.orders = [newOrder, ...state.orders]

        // increment pagination total
        state.pagination.total = (state.pagination.total || 0) + 1
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })
  }
})

export const {
  setCurrentPage,
  setItemsPerPage,
  clearError,
  handleOrder,
  handleFindOrder,
  handleFindCustomer,
  resetOrders,
  setSelectedProducts,
  splitOrderProductSetting
} = ordersSlice.actions

export default ordersSlice.reducer

// Selectors
export const selectOrders = state => state.orders.orders
export const selectOrdersLoading = state => state.orders.loading
export const selectOrdersError = state => state.orders.error
export const selectPagination = state => state.orders.pagination
export const selectCustomer = state => state.orders.selectedCustomer
export const selectSelectedProductIds = state => state.orders.selectedProductIds

export const selectCustomerById = (state, customerId) => {
  if (!state.orders.orders?.length) return []

  return state.orders.orders.filter(order => String(order.customerData?.id) === String(customerId))
}

export const selectOrderById = (state, orderId) => {
  return state.orders.orders.find(order => order.id === orderId) || null
}
