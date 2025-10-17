// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import { useDispatch, useSelector } from 'react-redux'
import CustomTextField from '@core/components/mui/TextField'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import { getAllRoles, getAllDepartments } from '@/redux-store/slices/roleSlice'
import { createUserThunk, editUserThunk } from '@/redux-store/slices/authSlice'

import { checkPermission, PERMISSIONS } from '@/hooks/Permissions'

// Vars
const initialData = {
  company: '',
  country: '',
  contact: ''
}

const AddUserDrawer = props => {
  // Props
  const { open, handleClose, userData, setData, mode = 'add', user: editingUser } = props

  const isEdit = mode === 'edit'

  const userCookie = Cookies.get('user')
  const user = userCookie ? JSON.parse(userCookie) : null
  const hasDepartmentView = checkPermission(PERMISSIONS['department.view'])

  // States
  const [formData, setFormData] = useState(initialData)
  const [localDepartments, setLocalDepartments] = useState([])
  const dispatch = useDispatch()
  const { roles, departments } = useSelector(state => state.role)
  const authLoading = useSelector(state => state.auth.isLoading)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      firstName: editingUser?.firstName || '',
      lastName: editingUser?.lastName || '',
      department: editingUser?.department?._id || '', // will store department _id
      email: editingUser?.email || '',
      role: editingUser?.role?._id || '' // will store role _id
    }
  })

  // When opening in edit mode or editingUser changes, reset defaults
  useEffect(() => {
    if (open) {
      resetForm({
        firstName: editingUser?.firstName || '',
        lastName: editingUser?.lastName || '',
        department: editingUser?.department?._id || '',
        email: editingUser?.email || '',
        role: editingUser?.role?._id || ''
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingUser])

  useEffect(() => {
    if (open) {
      dispatch(getAllRoles({ params: { page: 1, limit: 100 }, force: false }))

      if (hasDepartmentView) {
        dispatch(getAllDepartments({ params: { page: 1, limit: 100 }, force: false }))
      } else if (user?.department?._id && user?.department?.name) {
        setLocalDepartments([user.department])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = async data => {
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim()

    if (isEdit && editingUser?._id) {
      const payload = {
        _id: editingUser._id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        roleId: data.role,
        departmentId: data.department,
        departmentName: data.department?.name
      }

      await dispatch(editUserThunk(payload))
      await toast.success('User updated successfully')
      props.onSuccess?.()
      handleClose()
      return
    }

    // Construct payload for backend with _ids (create)
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      roleId: data.role, // _id
      departmentId: data.department,
      departmentName: data.department?.name
    }

    console.log(payload)

    const result = await dispatch(createUserThunk(payload))

    // The Redux store will automatically update with the new user from the API response
    // No need to manually add to local data since we're using Redux state
    handleClose()
    setFormData(initialData)
    resetForm({ firstName: '', lastName: '', email: '', role: '', department: '' })
  }

  const handleReset = () => {
    if (authLoading) return
    handleClose()
    setFormData(initialData)
  }

  return (
    <Dialog
      open={open}
      onClose={handleReset}
      fullWidth
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={handleReset} disableRipple disabled={authLoading}>
        <i className='bx-x' />
      </DialogCloseButton>
      <DialogTitle className='flex items-center justify-between p-6'>
        <Typography component='span' variant='h5'>
          {isEdit ? 'Edit User' : 'Add New User'}
        </Typography>
      </DialogTitle>
      <Divider />
      <form onSubmit={handleSubmit(data => onSubmit(data))}>
        <DialogContent className='p-6 flex flex-col gap-6'>
          <Controller
            name='firstName'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='First Name'
                placeholder='John'
                disabled={authLoading}
                {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='lastName'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Last Name'
                placeholder='Doe'
                disabled={authLoading}
                {...(errors.lastName && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='email'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='email'
                label='Email'
                placeholder='johndoe@gmail.com'
                disabled={authLoading || isEdit}
                {...(errors.email && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />

          <Controller
            name='role'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                id='role'
                label='Select Role'
                error={Boolean(errors.role)}
                disabled={authLoading}
                {...field}
              >
                <MenuItem value='' disabled>
                  Select Role
                </MenuItem>
                {roles?.map(role => (
                  <MenuItem key={role?._id} value={role?._id}>
                    {role?.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            )}
          />

          <Controller
            name='department'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                id='select-department'
                label='Select Department'
                error={Boolean(errors.department)}
                disabled={authLoading}
                {...field}
              >
                <MenuItem value='' disabled>
                  Select Department
                </MenuItem>
                {(hasDepartmentView ? departments : localDepartments)?.map(dept => (
                  <MenuItem key={dept?._id} value={dept?._id}>
                    {dept?.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            )}
          />
        </DialogContent>
        <DialogActions className='flex items-center gap-4 p-6'>
          <Button
            variant='contained'
            type='submit'
            disabled={authLoading}
            startIcon={authLoading ? <CircularProgress color='inherit' size={18} /> : null}
          >
            {isEdit ? 'Update' : 'Submit'}
          </Button>
          <Button variant='tonal' color='error' type='reset' onClick={() => handleReset()} disabled={authLoading}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddUserDrawer
