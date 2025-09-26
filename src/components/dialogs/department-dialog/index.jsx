'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Component Imports
import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'

// Redux
import { useDispatch, useSelector } from 'react-redux'
import { addDepartment, updateDepartment } from '@/redux-store/slices/roleSlice'

const DepartmentDialog = ({ open, setOpen, department }) => {
  const dispatch = useDispatch()
  const { isLoading } = useSelector(state => state.role)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (open) {
      setName(department?.name || '')
      setDescription(department?.description || '')
    }
  }, [open, department])

  const handleClose = () => setOpen(false)

  const onSubmit = async e => {
    e.preventDefault()

    const payload = {
      name: name?.trim(),
      description: description?.trim()
    }

    if (department?._id) {
      await dispatch(updateDepartment({ _id: department._id, ...payload }))
    } else {
      await dispatch(addDepartment(payload))
    }

    handleClose()
  }

  return (
    <Dialog
      fullWidth
      maxWidth='sm'
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
        {department?._id ? 'Edit Department' : 'Add Department'}
        <Typography component='span' className='flex flex-col text-center'>
          {department?._id ? 'Update' : 'Create'} department details
        </Typography>
      </DialogTitle>

      <form onSubmit={onSubmit}>
        <DialogContent className='overflow-visible flex flex-col gap-6 pbs-0 sm:pli-16'>
          <CustomTextField
            label='Name'
            fullWidth
            placeholder='Enter department name'
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
        </DialogContent>

        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' type='submit' disabled={isLoading}>
            {department?._id ? 'Update' : 'Submit'}
          </Button>
          <Button variant='tonal' type='button' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default DepartmentDialog
