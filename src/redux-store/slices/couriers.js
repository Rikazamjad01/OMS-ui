import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getRequest, postRequest } from '@/utils/api'

// =======================
// 🟩 Thunks
// =======================

// 📦 Get couriers (optionally active only)
export const fetchCouriers = createAsyncThunk(
  'couriers/fetchCouriers',
  async ({ active = null, force = false } = {}, { rejectWithValue }) => {
    try {
      const params = {}

      if (active !== null) params.active = active

      const res = await getRequest(`couriers/getCourier`, { params })

      if (!res?.status) throw new Error(res.data?.message || 'Failed to fetch couriers')

      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

// ➕ Add courier
export const addCourier = createAsyncThunk('couriers/addCourier', async (payload, { rejectWithValue }) => {
  try {
    const res = await postRequest(`couriers/addCourier`, payload)

    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message)
  }
})

// ✏️ Update courier
export const updateCourier = createAsyncThunk('couriers/updateCourier', async (payload, { rejectWithValue }) => {
  try {
    const { id, name } = payload

    console.log(payload, 'payload')
    const res = await postRequest(`couriers/update`,payload, 'patch')

    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message)
  }
})

// ❌ Delete courier
export const deleteCourier = createAsyncThunk('couriers/deleteCourier', async (id, { rejectWithValue }) => {
  try {
    const res = await postRequest(`couriers/delete/${id}`, {}, 'delete')

    return { id, data: res.data }
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message)
  }
})

// =======================
// 🟦 Slice
// =======================
const couriersSlice = createSlice({
  name: 'couriers',
  initialState: {
    couriers: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: builder => {
    builder

      // --- Fetch ---
      .addCase(fetchCouriers.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCouriers.fulfilled, (state, action) => {
        state.loading = false
        state.couriers = action.payload || []
      })
      .addCase(fetchCouriers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // --- Add ---
      .addCase(addCourier.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addCourier.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data) state.couriers.push(action.payload.data)
      })
      .addCase(addCourier.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // --- Update ---
      .addCase(updateCourier.fulfilled, (state, action) => {
        const updated = action.payload?.data || action.payload

        if (!updated?.id) return

        const index = state.couriers.findIndex(c => c.id === updated.id)

        if (index !== -1) {
          state.couriers[index] = { ...state.couriers[index], ...updated }
        } else {
          state.couriers.push(updated)
        }
      })
      .addCase(updateCourier.rejected, (state, action) => {
        state.error = action.payload
      })

      // --- Delete ---
      .addCase(deleteCourier.fulfilled, (state, action) => {
        state.couriers = state.couriers.filter(c => c.id !== action.payload.id)
      })
      .addCase(deleteCourier.rejected, (state, action) => {
        state.error = action.payload
      })
  }
})

export default couriersSlice.reducer

// =======================
// 🧭 Selectors
// ======================

export const selectCouriers = state => state.couriers.couriers || []
export const selectActiveCouriers = state => state.couriers.couriers?.filter(c => c.active) || []
export const selectCouriersLoading = state => state.couriers.loading
export const selectCouriersError = state => state.couriers.error
