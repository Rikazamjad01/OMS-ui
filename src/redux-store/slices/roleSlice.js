import { getRequest, postRequest } from '@/utils/api'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  roles: [],
  rolePagination: {},
  isLoading: false,
  error: null,
  departments: [],
  departmentPagination: {},
  permissions: []
}

export const getAllRoles = createAsyncThunk(
  'role/getAllRoles',
  async ({ params, force }, { rejectWithValue, getState }) => {
    try {
      const state = getState().role
      const { roles, rolePagination } = state
      if (roles.length > 1 && !force) {
        // Return in the same shape as API response
        return { roles, pagination: rolePagination }
      }
      const response = await getRequest(`roles/getRoles?${new URLSearchParams(params)}`)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getAllDepartments = createAsyncThunk(
  'department/getAllDepartments',
  async ({ params, force }, { rejectWithValue, getState }) => {
    try {
      const state = getState().role
      const { departments, departmentPagination } = state
      if (departments.length > 0 && !force) {
        // Return in the same shape as API response
        return { departments, pagination: departmentPagination }
      }
      const response = await getRequest(`departments/getDepartments?${new URLSearchParams(params)}`)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.message)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const addRole = createAsyncThunk('role/add', async (data, { rejectWithValue }) => {
  try {
    const response = await postRequest('roles/addRole', data)
    if (response.success) {
      return response.data
    }
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateRole = createAsyncThunk('role/update', async (data, { rejectWithValue }) => {
  try {
    const response = await postRequest(
      `roles/updateRole/${data._id}`,
      {
        description: data.description,
        name: data.name,
        permissions: data.permissions,
        scope: data.scope
      },
      'put'
    )
    if (response.success) {
      return response
    }
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const addDepartment = createAsyncThunk('department/add', async (data, { rejectWithValue }) => {
  try {
    const response = await postRequest('departments/addDepartment', data)
    if (response.success) {
      return response
    }
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateDepartment = createAsyncThunk('department/update', async (data, { rejectWithValue }) => {
  try {
    const { _id, ...rest } = data
    const response = await postRequest(`departments/updateDepartment/${_id}`, rest, 'put')
    if (response.success) {
      return response
    }
    return rejectWithValue(response.message)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getAllRoles.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAllRoles.fulfilled, (state, action) => {
        state.roles = action.payload.roles
        state.rolePagination = action.payload.pagination
        state.isLoading = false
        state.error = null
      })
      .addCase(getAllRoles.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })
      .addCase(getAllDepartments.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAllDepartments.fulfilled, (state, action) => {
        state.departments = action.payload.departments
        state.departmentPagination = action.payload.pagination
        state.isLoading = false
        state.error = null
      })
      .addCase(getAllDepartments.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })
      .addCase(addRole.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addRole.fulfilled, (state, action) => {
        state.roles.push(action.payload?.role)
        state.isLoading = false
        state.error = null
      })
      .addCase(addRole.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })
      .addCase(updateRole.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.roles = state.roles.map(role => (role._id === action.payload?.role?._id ? action.payload?.role : role))
        state.isLoading = false
        state.error = null
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })
      .addCase(addDepartment.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload?.department)
        state.isLoading = false
        state.error = null
      })
      .addCase(addDepartment.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })
      .addCase(updateDepartment.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.map(department =>
          department._id === action.payload?.department?._id ? action.payload?.department : department
        )
        state.isLoading = false
        state.error = null
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.error = action.payload
        state.isLoading = false
      })
  }
})

export default roleSlice.reducer
