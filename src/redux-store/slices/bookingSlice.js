import { getRequest } from '@/utils/api'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const initialState = {
  bookingOrder: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    itemsPerPage: 25,
    total: 0
  },
  lastFilters: {}
}

export const fetchBookingOrder = createAsyncThunk(
  'booking/fetchOrders',
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
        orderStatus: ['confirmed', 'processing'],
        ...(search && { search }),
        ...filterParams
      })

      const response = await getRequest(`booking?${params}`)

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

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchBookingOrder.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBookingOrder.fulfilled, (state, action) => {
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
        state.error = null
        state.loading = false
      })
      .addCase(fetchBookingOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
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
} = bookingSlice.actions

export default bookingSlice.reducer

// Selectors
export const selectBookingOrders = state => state.booking.orders
export const selectBookingOrdersLoading = state => state.booking.loading
export const selectBookingOrdersError = state => state.booking.error
export const selectBookingOrdersPagination = state => state.booking.pagination
export const selectBookingOrdersCustomer = state => state.booking.selectedCustomer
export const selectBookingOrdersSelectedProductIds = state => state.booking.selectedProductIds
