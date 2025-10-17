'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import { useDispatch, useSelector } from 'react-redux'
import Cookies from 'js-cookie'
import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Redux
import { addRole, updateRole, getAllDepartments } from '@/redux-store/slices/roleSlice'

// Cookies

const RoleDialog = ({ open, setOpen, title, role }) => {
  const dispatch = useDispatch()
  const { departments, isLoading } = useSelector(state => state.role)

  // Permissions derived from cookie user.role.permissions
  const cookieUser = useMemo(() => {
    try {
      const str = Cookies.get('user')

      return str ? JSON.parse(str) : null
    } catch {
      return null
    }
  }, [])

  const availablePermissions = useMemo(() => {
    return cookieUser?.role?.permissions?.map(p => ({ _id: p._id, name: p.name })) || []
  }, [cookieUser])

  // Group permissions by resource (before the dot), with actions as the part after the dot
  const groupedPermissions = useMemo(() => {
    const groups = {}

    for (const perm of availablePermissions) {
      if (!perm?.name) continue
      const [resource, action] = perm.name.split('.')

      if (!resource || !action) continue
      if (!groups[resource]) groups[resource] = []
      groups[resource].push({ _id: perm._id, action })
    }

    return groups
  }, [availablePermissions])

  // Form state
  const [name, setName] = useState(role?.name || '')
  const [description, setDescription] = useState(role?.description || '')
  const [scopeType, setScopeType] = useState(role?.scope?.type || 'organization')
  const [refIds, setRefIds] = useState(role?.scope?.refIds || [])
  const [selectedPermissions, setSelectedPermissions] = useState(role?.permissions?.map(p => p._id) || [])

  useEffect(() => {
    if (open && scopeType === 'department') {
      dispatch(getAllDepartments({ params: { page: 1, limit: 100 }, force: false }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scopeType])

  const handleTogglePermission = id => {
    setSelectedPermissions(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const handleClose = () => setOpen(false)

  const onSubmit = async e => {
    e.preventDefault()

    const payload = {
      name: name?.trim(),
      description: description?.trim(),
      permissions: selectedPermissions,
      scope: {
        type: scopeType,
        ...(scopeType === 'department' ? { refIds } : {})
      }
    }

    if (role?._id) {
      await dispatch(updateRole({ _id: role._id, ...payload }))
    } else {
      await dispatch(addRole(payload))
    }

    setName('')
    setDescription('')
    setScopeType('organization')
    setRefIds([])
    setSelectedPermissions([])

    handleClose()
  }

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      scroll='body'
      open={open}
      onClose={handleClose}
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className='bx-x' />
      </DialogCloseButton>
      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {role?._id ? 'Edit Role' : 'Add Role'}
        <Typography component='span' className='flex flex-col text-center'>
          Set Role Permissions
        </Typography>
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent className='overflow-visible flex flex-col gap-6 pbs-0 sm:pli-16'>
          <CustomTextField
            label='Role Name'
            fullWidth
            placeholder='Enter Role Name'
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <CustomTextField
            label='Description'
            fullWidth
            placeholder='Enter description'
            value={description}
            onChange={e => setDescription(e.target.value)}
            multiline
            minRows={2}
          />

          <div className='grid gap-6 sm:grid-cols-2'>
            <CustomTextField
              select
              fullWidth
              label='Scope Type'
              value={scopeType}
              onChange={e => setScopeType(e.target.value)}
            >
              <MenuItem value='organization'>Organization</MenuItem>
              <MenuItem value='department'>Department</MenuItem>
            </CustomTextField>

            {scopeType === 'department' ? (
              <CustomTextField
                select
                fullWidth
                label='Departments'
                value={refIds[0] || ''}
                onChange={e => setRefIds([e.target.value])}
              >
                <MenuItem value='' disabled>
                  Select Department
                </MenuItem>
                {departments?.map(dept => (
                  <MenuItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            ) : null}
          </div>

          <Typography variant='h5' className='min-is-[225px]'>
            Permissions
          </Typography>
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <tbody>
                {Object.keys(groupedPermissions).length === 0 ? (
                  <tr>
                    <td className='pis-0'>
                      <Typography variant='body2' className='text-textSecondary'>
                        No permissions available from your role.
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  Object.entries(groupedPermissions).map(([resource, actions], idx) => (
                    <tr key={resource || idx} className='border-be'>
                      <td className='pis-0'>
                        <Typography variant='h6' className='whitespace-nowrap flex-grow min-is-[225px] capitalize'>
                          {resource}
                        </Typography>
                      </td>
                      <td className='!text-end pie-0'>
                        <FormGroup className='flex-row justify-end flex-nowrap gap-6'>
                          {actions.map(item => (
                            <FormControlLabel
                              key={item._id}
                              className='mie-0 capitalize'
                              control={
                                <Checkbox
                                  checked={selectedPermissions.includes(item._id)}
                                  onChange={() => handleTogglePermission(item._id)}
                                />
                              }
                              label={item.action.replace('-', ' ')}
                            />
                          ))}
                        </FormGroup>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' type='submit' disabled={isLoading}>
            {role?._id ? 'Update' : 'Submit'}
          </Button>
          <Button variant='tonal' type='button' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default RoleDialog
