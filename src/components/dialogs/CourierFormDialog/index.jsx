'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  TextField,
  Autocomplete
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import CustomTextField from '@core/components/mui/TextField'
import DialogCloseButton from '../DialogCloseButton'
import { addCourier, updateCourier, fetchCouriers } from '@/redux-store/slices/couriers'

const platforms = [
  { label: 'Leopard', value: 'leopard' },
  { label: 'Daewoo', value: 'daewoo' },
  { label: 'PostEx', value: 'postEx' },
  { label: 'TCS', value: 'tcs' },
  { label: 'M&P', value: 'mp' }
]

const CourierFormDialog = ({ open, setOpen, editData = null }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    courierApiKey: '',
    courierApiPassword: '',
    platform: ''
  })

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        platform: editData.platform || ''
      })
    } else {
      setFormData({ name: '', courierApiKey: '', courierApiPassword: '', platform: '' })
    }
  }, [editData])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editData) {
        await dispatch(updateCourier({ id: editData.id, name: formData.name })).unwrap()
        toast.success('Courier updated successfully!')
      } else {
        await dispatch(addCourier(formData)).unwrap()
        toast.success('Courier added successfully!')
      }

      setOpen(false)
      dispatch(fetchCouriers())
    } catch (err) {
      const errorMessage =
        err?.message ||
        err?.error ||
        err?.response?.data?.message ||
        (typeof err === 'string' ? err : 'Something went wrong')

      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => setOpen(false)

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      fullWidth
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={handleClose} disableRipple>
        <i className='bx-x' />
      </DialogCloseButton>

      <DialogTitle>{editData ? 'Edit Courier' : 'Add New Courier'}</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className='w-full grid md:grid-cols-2 gap-4'>
            <div className='w-full'>
              <TextField
                fullWidth
                label='Courier Name'
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            {!editData && (
              <div className='w-full'>
                <TextField
                  fullWidth
                  label='Courier API Key'
                  value={formData.courierApiKey}
                  onChange={e => setFormData({ ...formData, courierApiKey: e.target.value })}
                  required
                  type='password'
                />
              </div>
            )}
            {!editData && (
              <div className='w-full'>
                <TextField
                  fullWidth
                  label='Courier Secret / Password'
                  value={formData.courierApiPassword}
                  onChange={e => setFormData({ ...formData, courierApiPassword: e.target.value })}
                  type='password'
                  required
                />
              </div>
            )}
            <div className='w-full'>
              <Autocomplete
                options={platforms}
                getOptionLabel={option => option.label}
                value={platforms.find(p => p.value === formData.platform) || null}
                onChange={(event, newValue) => setFormData({ ...formData, platform: newValue ? newValue.value : '' })}
                filterSelectedOptions
                renderInput={params => <TextField {...params} label='Platform' fullWidth required />}
                style={{ width: '100%' }}
                className='full-width-autocomplete'
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions>
          <Button type='submit' variant='contained'>
            {editData ? 'Update' : 'Add'}
          </Button>
          <Button variant='tonal' color='secondary' onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CourierFormDialog
