import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { getRequest } from '@/utils/api' // adjust path

// Async thunk for fetching customers
export const fetchCustomers = createAsyncThunk('customers/fetchCustomers', async ({ page, perPage, search = '' }, { rejectWithValue }) => {

  try {
    const params = new URLSearchParams(
      {
        page: page.toString(),
        limit: perPage.toString(),
        ...(search && { search })
      }
    )

    const response = await getRequest(`customers?${params}`)

    console.log(response)

    if (!response.status) {
      return rejectWithValue(response.message)
    }


    return {
        customers: response.customers || [],
        pagination: {
          page: response.pagination?.page || page,
          perPage: response.pagination?.limit || perPage,
          total: response.pagination?.total || 0
        }
      }

  } catch (error) {
    return rejectWithValue(error.message)
  }


  return response
})

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await getRequest(`customers/${customerId}`)

      if (!response.status) {
        return rejectWithValue(response.message)
      }

      return {
        customer: response.customer,
        stats: response.stats
      } // Adjust based on your API response structure
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

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
    },
    selectedCustomer: null,
    selectedCustomerLoading: false,
    selectedCustomerError: null,
  },
  reducers: {
    setCustomersCurrentPage: (state, action) => {
      state.pagination.page = action.payload
    },
    setCustomersItemsPerPage: (state, action) => {
      state.pagination.perPage = action.payload
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null
      state.selectedCustomerLoading = false
      state.selectedCustomerError = null
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
        state.pagination = action.payload.pagination
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchCustomerById.pending, state => {
        state.selectedCustomerLoading = true
        state.selectedCustomerError = null
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.selectedCustomerLoading = false
        state.selectedCustomer = action.payload
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.selectedCustomerLoading = false
        state.selectedCustomerError = action.payload || action.error.message
      })
  }
})

export const { setCustomersCurrentPage, setCustomersItemsPerPage, clearSelectedCustomer } = customerSlice.actions

// selectors
export const selectCustomersLoading = state => state.customers.loading
export const selectCustomersTableRows = state => state.customers.tableRows
export const selectCustomersPagination = state => state.customers.pagination

export const selectSelectedCustomer = state => state.customers.selectedCustomer
export const selectSelectedCustomerLoading = state => state.customers.selectedCustomerLoading
export const selectSelectedCustomerError = state => state.customers.selectedCustomerError

export const findCustomerById = id => state =>
  state.customers.tableRows.find(customer => {
    if (Array.isArray(customer.id)) {
      return customer.id.map(String).includes(String(id))
    }

    return String(customer.id) === String(id)
  }) || null

export default customerSlice.reducer
