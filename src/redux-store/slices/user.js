import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { getRequest } from '@/utils/api' // your api.js helper

// Async thunk to fetch single user
export const fetchUser = createAsyncThunk('users/getUserById', async (userId, { rejectWithValue }) => {
  try {
    const data = await getRequest(`users/getUserById/${userId}`)

    return data
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUser.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export default userSlice.reducer
