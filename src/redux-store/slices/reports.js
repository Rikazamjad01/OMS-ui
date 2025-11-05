// store/reportsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getRequest } from '@/utils/api'

export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async ({ reportType, brand, channel, dateStart, dateEnd }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        ...(reportType && { reportType }),
        ...(brand && { brand }),
        ...(channel && { channel }),
        ...(dateStart && { dateStart }),
        ...(dateEnd && { dateEnd })
      })

      const response = await getRequest(`reports?${params}`)

      if (!response?.status) {
        return rejectWithValue(response?.message || 'Failed to fetch reports')
      }

      return response?.data || [] // assuming backend returns array of rows
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    data: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchReports.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export default reportsSlice.reducer

// Selectors
export const selectReports = state => state.reports.data
export const selectReportsLoading = state => state.reports.loading
export const selectReportsError = state => state.reports.error
