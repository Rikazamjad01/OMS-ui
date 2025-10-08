import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getRequest, postRequest } from '@/utils/api'

const initialState = {
  platforms: [],
  tasks: [],
  extractedAgentsFromPlatform: [],
  ordersIds: [],
  agentTaskCounts: {},
  assignedTasks: [],
  assignedTasksMap: {},
  assignedTotals: { totalAgents: 0, totalTasks: 0 },
  unassignedTotal: 0,
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

// Fetch count of tasks per agent for a given platform
export const fetchAgentTaskCountsThunk = createAsyncThunk(
  'taskAssignment/fetchAgentTaskCounts',
  async ({ platformId }, { rejectWithValue }) => {
    try {
      const response = await getRequest(`taskAssignment/agent-task-counts?platformId=${platformId}`)
      if (response.success) {
        // Expecting response.data to be an array of { agentId, count }
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Mark an agent absent (server may optionally trigger redistribution)
export const markAgentAbsentThunk = createAsyncThunk(
  'taskAssignment/markAgentAbsent',
  async ({ platformId, agentId }, { rejectWithValue }) => {
    try {
      const response = await postRequest('taskAssignment/mark-absent', { platformId, agentId })
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Reassign all tasks from one agent to another within a platform
export const reassignAgentTasksThunk = createAsyncThunk(
  'taskAssignment/reassignAgentTasks',
  async ({ platformId, fromAgentId, toAgentId, toAgentIds }, { rejectWithValue }) => {
    try {
      const payload = { platformId, fromAgentId }
      if (Array.isArray(toAgentIds) && toAgentIds.length > 0) {
        payload.toAgentIds = toAgentIds
      } else if (toAgentId) {
        payload.toAgentId = toAgentId
      }
      const response = await postRequest('taskAssignment/reassign', payload)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Fetch assigned tasks per agent for a given platform
export const fetchAssignedTasksThunk = createAsyncThunk(
  'taskAssignment/fetchAssignedTasks',
  async ({ platform }, { rejectWithValue }) => {
    try {
      const response = await getRequest(`taskAssignment/assigned-tasks?platform=${platform}`)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Fetch total unassigned orders for a given platform
export const fetchUnassignedOrdersThunk = createAsyncThunk(
  'taskAssignment/fetchUnassignedOrders',
  async ({ platform, brand }, { rejectWithValue, getState }) => {
    try {
      const { taskAsssignment } = getState()
      const platforms = taskAsssignment.platforms
      const platformData = platforms.find(p => p._id === platform)
      if (!platformData?._id) {
        return rejectWithValue('Platform not found')
      }
      const params = new URLSearchParams()
      params.append('platform', platformData._id)
      params.append('platformName', platformData.platforms[0])
      if (brand) params.append('brand', brand)
      const response = await getRequest(`taskAssignment/unassigned-orders?${params.toString()}`)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Mark absent and reassign in one call per new API contract
export const markAbsentAndReassignThunk = createAsyncThunk(
  'taskAssignment/markAbsentAndReassign',
  async ({ platform, absentAgentId, reassignToAgents }, { rejectWithValue }) => {
    try {
      const payload = {
        platform,
        absentAgentId,
        reassignToAgents
      }
      const response = await postRequest('taskAssignment/mark-absent', payload)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

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
        // state.platforms = [action.payload, ...state.platforms]
        if (state.platforms.find(platform => platform._id === action.payload._id)) {
          state.platforms = state.platforms.map(platform =>
            platform._id === action.payload._id ? action.payload : platform
          )
        } else {
          state.platforms = [action.payload, ...state.platforms]
        }
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
      .addCase(fetchAgentTaskCountsThunk.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAgentTaskCountsThunk.fulfilled, (state, action) => {
        // Normalize into a map { [agentId]: count }
        const counts = {}
        ;(action.payload || []).forEach(item => {
          if (item && item.agentId) counts[item.agentId] = item.count ?? 0
        })
        state.agentTaskCounts = counts
        state.loading = false
        state.error = null
      })
      .addCase(fetchAgentTaskCountsThunk.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
      .addCase(markAgentAbsentThunk.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(markAgentAbsentThunk.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
      })
      .addCase(markAgentAbsentThunk.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
      .addCase(reassignAgentTasksThunk.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(reassignAgentTasksThunk.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
      })
      .addCase(reassignAgentTasksThunk.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
      .addCase(fetchAssignedTasksThunk.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAssignedTasksThunk.fulfilled, (state, action) => {
        const { data, totalAgents, totalTasks } = action.payload || {}
        state.assignedTasks = Array.isArray(data) ? data : []
        const map = {}
        state.assignedTasks.forEach(item => {
          if (item?.agentId) map[item.agentId] = Number(item.tasks) || 0
        })
        state.assignedTasksMap = map
        state.assignedTotals = {
          totalAgents: Number(totalAgents) || 0,
          totalTasks: Number(totalTasks) || 0
        }
        state.loading = false
        state.error = null
      })
      .addCase(fetchAssignedTasksThunk.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
      .addCase(fetchUnassignedOrdersThunk.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUnassignedOrdersThunk.fulfilled, (state, action) => {
        state.unassignedTotal = Number(action.payload?.total) || 0
        state.loading = false
        state.error = null
      })
      .addCase(fetchUnassignedOrdersThunk.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
      .addCase(markAbsentAndReassignThunk.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(markAbsentAndReassignThunk.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
      })
      .addCase(markAbsentAndReassignThunk.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
  }
})

export const { extractAgentsFromPlatform } = taskAsssignmentSlice.actions
export default taskAsssignmentSlice.reducer
