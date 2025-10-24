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
import DialogCloseButton from '../DialogCloseButton'
import { addCourier, updateCourier, fetchCouriers } from '@/redux-store/slices/couriers'
import cities from '@/data/cities/cities'

const platforms = [
  { label: 'Leopard', value: 'leopard' },
  { label: 'Daewoo', value: 'daewoo' },
  { label: 'PostEx', value: 'postEx' }
]

const CourierFormDialog = ({ open, setOpen, editData = null }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    platform: '',
    courierApiKey: '',
    courierApiPassword: '',
    courierApiUser: '',
    originLocation: '',
    courierToken: ''
  })

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        platform: editData.platform || '',
        courierApiKey: editData.courierApiKey || '',
        courierApiPassword: editData.courierApiPassword || '',
        courierApiUser: editData.courierApiUser || '',
        originLocation: editData.originLocation || '',
        courierToken: editData.courierToken || ''
      })
    } else {
      resetForm()
    }
  }, [editData])

  const resetForm = () => {
    setFormData({
      name: '',
      platform: '',
      courierApiKey: '',
      courierApiPassword: '',
      courierApiUser: '',
      originLocation: '',
      courierToken: ''
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editData) {
        await dispatch(updateCourier({ id: editData.id, name: formData.name, })).unwrap()
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

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      fullWidth
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className='bx-x' />
      </DialogCloseButton>

      <DialogTitle>{editData ? 'Edit Courier' : 'Add New Courier'}</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className={`w-full grid ${ editData ? 'md:grid-cols-1' : 'md:grid-cols-2 gap-4'}`}>
            {/* Select Platform */}
            {!editData && (
              <Autocomplete
                options={platforms}
                getOptionLabel={option => option.label}
                value={platforms.find(p => p.value === formData.platform) || null}
                onChange={(event, newValue) =>
                  setFormData({
                    ...formData,
                    platform: newValue ? newValue.value : '',
                    courierApiKey: '',
                    courierApiPassword: '',
                    courierApiUser: '',
                    originLocation: '',
                    courierToken: ''
                  })
                }
                renderInput={params => <TextField {...params} label='Platform' fullWidth required />}
              />
            )}

            {/* Courier Name */}
            <TextField
              fullWidth
              label='Courier Name'
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />

            {/* Leopard Fields */}
            {formData.platform === 'leopard' && !editData && (
              <>
                <TextField
                  fullWidth
                  label='Courier API Key'
                  value={formData.courierApiKey}
                  onChange={e => setFormData({ ...formData, courierApiKey: e.target.value })}
                  required
                  type='password'
                />
                <TextField
                  fullWidth
                  label='Courier API Password'
                  value={formData.courierApiPassword}
                  onChange={e => setFormData({ ...formData, courierApiPassword: e.target.value })}
                  type='password'
                  required
                />
              </>
            )}

            {/* Daewoo Fields */}
            {formData.platform === 'daewoo' && !editData && (
              <>
                <TextField
                  fullWidth
                  label='Courier API Key'
                  value={formData.courierApiKey}
                  onChange={e => setFormData({ ...formData, courierApiKey: e.target.value })}
                  required
                  type='password'
                />

                <TextField
                  fullWidth
                  label='Courier API User'
                  value={formData.courierApiUser}
                  onChange={e => setFormData({ ...formData, courierApiUser: e.target.value })}
                  required
                />

                <Autocomplete
                  options={cities}
                  onChange={(e, newValue) => setFormData({ ...formData, originLocation: newValue || '' })}
                  value={formData.originLocation || ''}
                  renderInput={params => <TextField {...params} label='Origin Location' fullWidth required />}
                />

                <TextField
                  fullWidth
                  label='Courier API Password'
                  value={formData.courierApiPassword}
                  onChange={e => setFormData({ ...formData, courierApiPassword: e.target.value })}
                  type='password'
                  required
                />
              </>
            )}

          </div>
          {/* PostEx Fields */}
          {formData.platform === 'postEx' && (
            <TextField
              fullWidth
              label='Courier Token'
              value={formData.courierToken}
              onChange={e => setFormData({ ...formData, courierToken: e.target.value })}
              required
              type='password'
              className='mt-4'
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button type='submit' variant='contained' disabled={loading}>
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
