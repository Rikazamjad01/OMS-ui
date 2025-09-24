import { getRequest, postRequest } from '@/utils/api'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const initialState = {
  zones: [],
  loading: false,
  error: null
}

export const fetchZones = createAsyncThunk('zones/fetchZones', async (_, { rejectWithValue }) => {
  try {
    const response = await getRequest('zones')
    if (response.status) {
      if (response.data.length > 0) {
        return response.data
      }

      return []
    }

    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const createZone = createAsyncThunk('zones/create', async (payload, { rejectWithValue, getState }) => {
  try {
    let { cities, couriers, namingConvention, name } = payload
    const state = getState()
    if (!namingConvention) {
      namingConvention = state.zones[0].namingConvention
    }
    const response = await postRequest('zones', { config: { cities }, couriers, namingConvention, name })
    console.log(response, 'response in createZone')
    if (response.status) {
      return response.data
    }
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const updateZone = createAsyncThunk('zones/update', async ({ id, cities, couriers }, { rejectWithValue }) => {
  try {
    const response = await postRequest(`zones/${id}`, { config: { cities }, couriers }, 'patch')
    console.log(response, 'response in updateZone')
    if (response.status) {
      return response.data
    }
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const removeCity = createAsyncThunk('zones/removeCity', async ({ id, city }, { rejectWithValue }) => {
  try {
    const response = await postRequest(`zones/remove-city/${id}`, { city }, 'patch')
    console.log(response, 'response in removeCity')
    if (response.status) {
      return response.data
    }
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const zonesSlice = createSlice({
  name: 'zones',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchZones.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchZones.fulfilled, (state, action) => {
        state.loading = false
        state.zones = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchZones.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createZone.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(createZone.fulfilled, (state, action) => {
        state.loading = false
        state.zones = [...state.zones, action.payload]
      })
      .addCase(createZone.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateZone.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateZone.fulfilled, (state, action) => {
        state.loading = false
        state.zones = state.zones.map(zone => (zone.id === action.payload.id ? action.payload : zone))
      })
      .addCase(updateZone.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(removeCity.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(removeCity.fulfilled, (state, action) => {
        state.loading = false
        state.zones = state.zones.map(zone => (zone.id === action.payload.id ? action.payload : zone))
      })
      .addCase(removeCity.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export default zonesSlice.reducer

// Selectors
export const selectZonesLoading = state => state.zones.loading
export const selectZonesError = state => state.zones.error
export const selectZones = state => state.zones.zones
