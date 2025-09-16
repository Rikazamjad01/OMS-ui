import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { getRequest } from '@/utils/api'

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ page = 1, limit = 25, search = '', filters = {} }, { rejectWithValue, getState }) => {
    try {
      const state = getState()
      const currentData = state.products.products

      // Optional optimization: skip if same page + same filters already loaded
      if (
        currentData.length > 0 &&
        state.products.pagination.currentPage === page &&
        JSON.stringify(state.products.lastFilters) === JSON.stringify(filters)
      ) {
        return null
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...filters
      })

      const response = await getRequest(`products?${params}`)

      if (!response.status) {
        return rejectWithValue(response.message)
      }

      return {
        products: response.products || [],
        total: response.pagination?.total || 0,
        page: response.pagination?.page || page,
        limit: response.pagination?.limit || limit,
        filters
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    loading: false,
    error: null,
    lastFilters: {},
    pagination: {
      currentPage: 1,
      itemsPerPage: 25,
      total: 0
    },
    selectedProducts: [], // For multi-select
    selectedProductDetails: null // For single product details
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload
    },
    setItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload
    },
    setSelectedProducts: (state, action) => {
      state.selectedProducts = action.payload
    },
    setSelectedProductDetails: (state, action) => {
      state.selectedProductDetails = action.payload
    },
    clearError: state => {
      state.error = null
    },
    resetProducts: state => {
      state.products = []
      state.selectedProducts = []
      state.selectedProductDetails = null
      state.pagination = {
        currentPage: 1,
        itemsPerPage: 25,
        total: 0
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false

        if (action.payload) {
          state.products = action.payload.products
          state.pagination = {
            currentPage: action.payload.page,
            itemsPerPage: action.payload.limit,
            total: action.payload.total
          }
          state.lastFilters = action.payload.filters || {}
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const {
  setCurrentPage,
  setItemsPerPage,
  setSelectedProducts,
  setSelectedProductDetails,
  clearError,
  resetProducts
} = productsSlice.actions

export default productsSlice.reducer

// Selectors
export const selectProducts = state => state.products.products || []
export const selectProductsLoading = state => state.products.loading || false
export const selectProductsError = state => state.products.error
export const selectProductsPagination = state => state.products.pagination
export const selectSelectedProducts = state => state.products.selectedProducts
export const selectSelectedProductDetails = state => state.products.selectedProductDetails


