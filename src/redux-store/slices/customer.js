import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { getRequest } from '@/utils/api' // adjust path

// Async thunk for fetching customers
export const fetchCustomers = createAsyncThunk('customers/fetchCustomers', async ({ page, perPage }) => {
  const response = await getRequest(`customers?page=${page}&limit=${perPage}`)

  return response
})

const customerSlice = createSlice({
  name: 'customers',
  initialState: {
    tableRows: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      perPage: 25,
      total: 0
    }
  },
  reducers: {
    setCustomersCurrentPage: (state, action) => {
      state.pagination.page = action.payload
    },
    setCustomersItemsPerPage: (state, action) => {
      state.pagination.perPage = action.payload
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCustomers.pending, state => {
        state.loading = true
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.tableRows = action.payload.customers
        state.pagination.total = action.payload.total // depends on API shape
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

export const { setCustomersCurrentPage, setCustomersItemsPerPage } = customerSlice.actions

// selectors
export const selectCustomersLoading = state => state.customers.loading
export const selectCustomersTableRows = state => state.customers.tableRows
export const selectCustomersPagination = state => state.customers.pagination

export const findCustomerById = id => state =>
  state.customers.tableRows.find(customer => {
    if (Array.isArray(customer.id)) {
      return customer.id.map(String).includes(String(id))
    }

    return String(customer.id) === String(id)
  }) || null

export default customerSlice.reducer
