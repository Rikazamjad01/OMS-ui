import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'

import { getRequest, postRequest } from '@/utils/api'

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ page = 1, limit = 25, search = '', filters = {} }, { rejectWithValue, getState }) => {
    try {
      // Check if we already have the data to avoid redundant fetches
      const state = getState()
      const currentData = state.orders.orders

      // If we're fetching the same page with same filters, skip
      if (
        currentData.length > 0 &&
        state.orders.pagination.currentPage === page &&
        JSON.stringify(state.orders.lastFilters) === JSON.stringify(filters)
      ) {
        return null // Indicate no fetch needed
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...filters
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

      // Use the correct endpoint and format from your Postman example
      const response = await postRequest(`orders/add`, {
        id: orderId,
        tags: tags || '',
        remarks: remarks !== undefined ? remarks : order?.remarks || '',
        comments: comments !== undefined ? comments : order?.comments || ''
      })

      if (!response.status) {
        return rejectWithValue(response.message)
      }

      // Return the updated order data
      return {
        orderId,
        comments: response.data?.comments || '',
        remarks: response.data?.remarks || '',
        tags: response.data?.tags || ''
      }
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
    selectedProductIds: []
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
      state.selectedProductIds = action.payload
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

        // Only update if we got new data
        if (action.payload) {
          state.orders = action.payload.orders
          state.pagination = {
            currentPage: action.payload.page,
            itemsPerPage: action.payload.limit,
            total: action.payload.total
          }
          state.lastFilters = action.payload.filters || {}
        }
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateOrderCommentsAndRemarks.fulfilled, (state, action) => {
        const { orderId, comments, remarks, tags } = action.payload
        const orderIndex = state.orders.findIndex(order => order.id === orderId)

        if (orderIndex !== -1) {
          // Update the order with new data
          const updatedOrder = {
            ...state.orders[orderIndex],
            comments: typeof comments === 'string' ? comments.split('\n') : comments,
            remarks: typeof remarks === 'string' ? remarks.split('\n') : remarks,
            tags: Array.isArray(tags)
              ? tags.join(', ') // convert array → "urgent, paid"
              : tags || order?.tags || ''
          }

          state.orders[orderIndex] = updatedOrder

          if (state.selectedOrders?.id === orderId) {
            state.selectedOrders = updatedOrder
          }
        }
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
  setSelectedProducts
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
