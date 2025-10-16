'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Components
import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'

// Redux selector (make sure it’s exported from couriers.js)
import { selectActiveCouriers } from '@/redux-store/slices/couriers'

const EditCourierInfo = ({ open, setOpen, data, onSubmit }) => {

  console.log(data, 'data')

  // ✅ get active couriers from Redux
  const activeCouriers = useSelector(selectActiveCouriers)

  const initial = useMemo(
    () => ({
      orderIds: data?.orderIds || [],
      courier: data?.courier || 'none',
      reason: data?.reason || ''
    }),
    [data]
  )

  useEffect(() => {
    if (!data) return

    // Try to find the courier by id, platform, or name
    const matchedCourier =
      activeCouriers.find(
        c =>
          c.id === data.courier ||
          c.name?.toLowerCase() === data.courier?.toLowerCase() ||
          c.platform?.toLowerCase() === data.courier?.toLowerCase()
      ) || null

    setForm({
      orderIds: data?.orderIds || [],
      courier: matchedCourier?.id || '', // ✅ preselect actual id
      reason: data?.reason || ''
    })
  }, [data, activeCouriers])

  const [form, setForm] = useState(initial)
  const [submitting, setSubmitting] = useState(false)

  const handleClose = () => {
    if (submitting) return
    setOpen(false)
    setForm(initial)
  }

  const handleSubmit = async e => {
    e?.preventDefault?.()
    if (submitting) return

    setSubmitting(true)
    const ids = Array.isArray(form.orderIds) ? form.orderIds : [form.orderIds].filter(Boolean)

    if (ids.length === 0) {
      setOpen(false)
      setSubmitting(false)
      return
    }

    try {
      await onSubmit?.(
        {
          orderIds: ids,
          courier: form.courier,
          reason: form.reason
        },
        {
          close: () => setOpen(false),
          reset: () => setForm(initial),
          done: () => setSubmitting(false)
        }
      )
    } catch (err) {
      console.error(err, 'Failed to edit courier info')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      fullWidth
      maxWidth='sm'
      open={open}
      onClose={handleClose}
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={handleClose} disableRipple>
        <i className='bx-x' />
      </DialogCloseButton>

      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Edit Courier
        <Typography component='span' className='flex flex-col text-center'>
          Select a courier and provide a reason.
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className='overflow-visible pbs-0 sm:pli-16' sx={{ overflowX: 'hidden' }}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                select
                fullWidth
                label='Courier'
                value={form.courier} // now this will store courier.id
                onChange={e => setForm(prev => ({ ...prev, courier: e.target.value }))}
              >
                {activeCouriers.map(courier => (
                  <MenuItem key={courier.id} value={courier.id}>
                    {courier.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Reason'
                required
                placeholder='Why are you changing the courier?'
                value={form.reason}
                onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' type='submit' disabled={submitting} className='max-sm:is-full'>
            {submitting ? 'Saving…' : 'Submit'}
          </Button>
          <Button variant='tonal' color='secondary' type='button' onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditCourierInfo
