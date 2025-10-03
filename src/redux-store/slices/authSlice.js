import { getRequest, postRequest } from '@/utils/api'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import cookies from 'js-cookie'

const initialState = {
  user: null,
  error: null,
  isLoading: false,
  isAuthenticated: false,
  allUsers: [],
  allUsersPagination: {
    total: 0,
    page: '1',
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false
  }
}

export const loginThunk = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { email, password } = credentials
    if (!email || !password) {
      return rejectWithValue('Email and password are required')
    }
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

export const changePasswordThunk = createAsyncThunk('auth/changePassword', async (data, { rejectWithValue }) => {
  try {
    const response = await postRequest('auth/change-password', data)
    if (response.success) {
      return response
    }
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

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

export const getAlUsersThunk = createAsyncThunk(
  'auth/getAllUsers',
  async ({ params, force = false }, { rejectWithValue, getState }) => {
    try {
      const { allUsers, allUsersPagination } = getState().auth
      if (allUsers.length > 0 && !force) {
        return { users: allUsers, pagination: allUsersPagination }
      }
      const response = await getRequest(`users/getUsers?${new URLSearchParams(params)}`)
      if (response.success) {
        return response.data
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createUserThunk = createAsyncThunk('auth/createUser', async (data, { rejectWithValue, getState }) => {
  try {
    const response = await postRequest('users/createUser', data)
    if (response.success) {
      // Get roles and departments from state
      const { roles, departments } = getState().role

      const userData = response.userData
      if (userData) {
        // Find department name by ID
        const department = departments.find(dept => dept._id === userData.department)
        const departmentName = department ? department.name : userData.department

        // Find role name by ID
        const role = roles.find(r => r._id === userData.role)
        const roleName = role ? role.name : userData.role

        // Return enhanced user data
        return {
          ...response,
          userData: {
            ...userData,
            departmentName,
            roleName
          }
        }
      }

      return response
    }
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const editUserThunk = createAsyncThunk('auth/editUser', async (data, { rejectWithValue, getState }) => {
  try {
    const { _id, ...rest } = data
    const response = await postRequest(`users/updateUser/${_id}`, rest, 'put')
    if (response.success) {
      return response
    }
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: state => {
      const existingUser = state.user
      if (!existingUser) {
        const user = cookies.get('user')
        if (user) {
          state.user = JSON.parse(user)
          state.isAuthenticated = true
          state.isLoading = false
        } else {
          state.user = null
          state.isAuthenticated = false
          state.isLoading = false
        }
      }
    },
    clearError: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(loginThunk.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        if (action.payload === false) {
          state.isLoading = false
          state.error = null
          return
        }
        state.user = action.payload
        state.isAuthenticated = true
        state.isLoading = false
        state.error = null
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })
      .addCase(logoutThunk.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(logoutThunk.fulfilled, state => {
        state.isLoading = false
        state.error = null
        state.isAuthenticated = false
        state.user = null
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })
      .addCase(getAlUsersThunk.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAlUsersThunk.fulfilled, (state, action) => {
        state.allUsers = action.payload.users
        state.allUsersPagination = action.payload.pagination
        state.isLoading = false
        state.error = null
      })
      .addCase(getAlUsersThunk.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })
      .addCase(createUserThunk.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createUserThunk.fulfilled, (state, action) => {
        state.allUsers.push(action.payload?.userData)
        state.isLoading = false
        state.error = null
      })
      .addCase(createUserThunk.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })
      .addCase(editUserThunk.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(editUserThunk.fulfilled, (state, action) => {
        state.allUsers = state.allUsers.map(user =>
          user._id === action.payload?.user?._id ? action.payload?.user : user
        )
        state.isLoading = false
        state.error = null
      })
      .addCase(editUserThunk.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })
      .addCase(changePasswordThunk.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePasswordThunk.fulfilled, (state, action) => {
        cookies.remove('resetToken')
        state.isLoading = false
        state.error = null
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })
  }
})
export const { setUser, clearError } = authSlice.actions
export default authSlice.reducer
export const selectIsAuthenticated = state => state.auth.isAuthenticated
export const selectIsLoading = state => state.auth.isLoading
export const selectError = state => state.auth.error
export const selectUser = state => state.auth.user
