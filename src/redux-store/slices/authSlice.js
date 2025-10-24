import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import cookies from 'js-cookie'
import { getRequest, postRequest } from '@/utils/api'

const initialState = {
  user: null,
  error: null,
  isLoading: false,
  isAuthenticated: false,

  // Users list data
  allUsers: [],
  allUsersPagination: {
    total: 0,
    page: '1',
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false
  },

  // ✅ Added: store complete API response
  allUsersData: null
}

// =============================
// LOGIN THUNK
// =============================
export const loginThunk = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { email, password } = credentials

    if (!email || !password) return rejectWithValue('Email and password are required')

    const response = await postRequest('auth/login', credentials)

    if (response.success) {
      if (response.resetToken) {
        cookies.set('resetToken', response.resetToken)
        return false
      }

      const user = response.user
      const token = response.tokens

      cookies.set('user', JSON.stringify(user))
      cookies.set('token', JSON.stringify(token))
      return user
    }

    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// =============================
// CHANGE PASSWORD
// =============================
export const changePasswordThunk = createAsyncThunk('auth/changePassword', async (data, { rejectWithValue }) => {
  try {
    const response = await postRequest('auth/change-password', data)

    if (response.success) return response
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// =============================
// LOGOUT
// =============================
export const logoutThunk = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const response = await postRequest('auth/logout')

    if (response.success) {
      cookies.remove('user')
      cookies.remove('token')
      return true
    }

    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// =============================
// GET ALL USERS
// =============================
export const getAlUsersThunk = createAsyncThunk(
  'auth/getAllUsers',
  async ({ params, force = false }, { rejectWithValue, getState }) => {
    try {
      const { allUsers, allUsersPagination } = getState().auth

      // Use cached data unless forced
      if (allUsers.length > 0 && !force) {
        return { users: allUsers, pagination: allUsersPagination, fullResponse: null }
      }

      const response = await getRequest(`users/getUsers?${new URLSearchParams(params)}`)

      if (response.success) {
        // ✅ Return full response so UI can access additional info if needed
        return {
          users: response.data?.users || [],
          pagination: response.data?.pagination || {},
          fullResponse: response.data
        }
      }

      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// =============================
// CREATE USER
// =============================
export const createUserThunk = createAsyncThunk('auth/createUser', async (data, { rejectWithValue, getState }) => {
  try {
    const response = await postRequest('users/createUser', data)

    if (!response.success) return rejectWithValue(response.message)

    const { roles, departments } = getState().role
    const userData = response.userData

    if (userData) {
      const department = departments.find(dept => dept._id === userData.department)
      const role = roles.find(r => r._id === userData.role)

      return {
        ...response,
        userData: {
          ...userData,
          departmentName: department ? department.name : userData.department,
          roleName: role ? role.name : userData.role
        }
      }
    }

    return response
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// =============================
// EDIT USER
// =============================
export const editUserThunk = createAsyncThunk('auth/editUser', async (data, { rejectWithValue }) => {
  try {
    const { _id, ...rest } = data
    const response = await postRequest(`users/updateUser/${_id}`, rest, 'put')

    if (response.success) return response
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// =============================
// UPDATE USER STATUS
// =============================
export const updateUserStatusThunk = createAsyncThunk(
  'auth/updateUserStatus',
  async ({ userId, newStatus }, { rejectWithValue }) => {
    try {
      const response = await postRequest(`users/updateUser/${userId}`, { isVerified: newStatus === 'active' }, 'put')

      if (response.success) {
        return { userId, newStatus }
      }

      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// =============================
// RESET PASSWORD THUNK
// =============================
export const resetPasswordThunk = createAsyncThunk('auth/resetPassword', async (data, { rejectWithValue }) => {
  try {
    const response = await postRequest('auth/reset-password', data)

    if (response.success) return response
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})


// =============================
// SLICE
// =============================
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: state => {
      if (!state.user) {
        const user = cookies.get('user')

        if (user) {
          state.user = JSON.parse(user)
          state.isAuthenticated = true
        } else {
          state.user = null
          state.isAuthenticated = false
        }

        state.isLoading = false
      }
    },
    clearError: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    builder

      // LOGIN
      .addCase(loginThunk.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        if (action.payload === false) return
        state.user = action.payload
        state.isAuthenticated = true
        state.isLoading = false
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })

      // LOGOUT
      .addCase(logoutThunk.pending, state => {
        state.isLoading = true
      })
      .addCase(logoutThunk.fulfilled, state => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })

      // GET USERS
      .addCase(getAlUsersThunk.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAlUsersThunk.fulfilled, (state, action) => {
        state.allUsers = action.payload.users
        state.allUsersPagination = action.payload.pagination
        state.allUsersData = action.payload.fullResponse // ✅ store full data
        state.isLoading = false
      })
      .addCase(getAlUsersThunk.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })

      // CREATE USER
      .addCase(createUserThunk.pending, state => {
        state.isLoading = true
      })
      .addCase(createUserThunk.fulfilled, (state, action) => {
        state.allUsers.push(action.payload?.userData)
        state.isLoading = false
      })
      .addCase(createUserThunk.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })

      // EDIT USER
      .addCase(editUserThunk.pending, state => {
        state.isLoading = true
      })
      .addCase(editUserThunk.fulfilled, (state, action) => {
        state.allUsers = state.allUsers.map(user =>
          user._id === action.payload?.user?._id ? action.payload?.user : user
        )
        state.isLoading = false
      })
      .addCase(editUserThunk.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })

      // CHANGE PASSWORD
      .addCase(changePasswordThunk.pending, state => {
        state.isLoading = true
      })
      .addCase(changePasswordThunk.fulfilled, state => {
        cookies.remove('resetToken')
        state.isLoading = false
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })

      //change status
      .addCase(updateUserStatusThunk.fulfilled, (state, action) => {
        const { userId, newStatus } = action.payload

        state.allUsers = state.allUsers.map(user =>
          user._id === userId ? { ...user, isVerified: newStatus === 'active' } : user
        )
      })

      // RESET PASSWORD
      .addCase(resetPasswordThunk.pending, state => {
        state.isLoading = true
      })
      .addCase(resetPasswordThunk.fulfilled, state => {
        state.isLoading = false
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })
  }
})

// =============================
// EXPORTS
// =============================
export const { setUser, clearError } = authSlice.actions
export default authSlice.reducer

// Selectors
export const selectUser = state => state.auth.user
export const selectIsAuthenticated = state => state.auth.isAuthenticated
export const selectIsLoading = state => state.auth.isLoading
export const selectError = state => state.auth.error
export const selectAllUsers = state => state.auth.allUsers
export const selectAllUsersData = state => state.auth.allUsersData // ✅ use this to access full API response
