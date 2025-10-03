import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getRequest, postRequest } from '@/utils/api'

const initialState = {
  platforms: [],
  tasks: [],
  extractedAgentsFromPlatform: [],
  ordersIds: [],
  loading: false,
  error: null
}

export const getPendingOrdersThunk = createAsyncThunk('orders/get/pending', async (_, { rejectWithValue }) => {
  try {
    const response = await getRequest('orders/get/pending')
    if (response.status) {
      return response.data
    }
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchPlatformsThunk = createAsyncThunk(
  'platform/getPlatforms',
  async (params, { rejectWithValue, getState }) => {
    try {
      const response = await getRequest(`platform/getPlatforms?${new URLSearchParams(params)}`)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const addPlatformsThunk = createAsyncThunk('platform/addPlatform', async (data, { rejectWithValue }) => {
  try {
    const response = await postRequest('platform/addPlatform', data)
    if (response.success) {
      return response.platformAssignment
    }
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const assignTaskThunk = createAsyncThunk('taskAssignment/assignTask', async (data, { rejectWithValue }) => {
  try {
    const response = await postRequest('taskAssignment/task-assignment', data)
    if (response.success) {
      return response
    }
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const taskAsssignmentSlice = createSlice({
  name: 'taskAsssignment',
  initialState,
  reducers: {
    extractAgentsFromPlatform: (state, action) => {
      const { id } = action.payload
      const selectedPlatform = state.platforms.find(platform => platform._id === id)
      if (selectedPlatform) {
        state.extractedAgentsFromPlatform = selectedPlatform.agents
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getPendingOrdersThunk.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(getPendingOrdersThunk.fulfilled, (state, action) => {
        state.ordersIds = action.payload
        state.loading = false
        state.error = null
      })
      .addCase(getPendingOrdersThunk.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
      .addCase(fetchPlatformsThunk.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPlatformsThunk.fulfilled, (state, action) => {
        state.platforms = action.payload.platformAssignment
        state.loading = false
        state.error = null
      })
      .addCase(fetchPlatformsThunk.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
      .addCase(addPlatformsThunk.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addPlatformsThunk.fulfilled, (state, action) => {
        state.platforms = [action.payload, ...state.platforms]
        state.loading = false
        state.error = null
      })
      .addCase(addPlatformsThunk.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
      .addCase(assignTaskThunk.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(assignTaskThunk.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
      })
      .addCase(assignTaskThunk.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
  }
})

export const { extractAgentsFromPlatform } = taskAsssignmentSlice.actions
export default taskAsssignmentSlice.reducer
