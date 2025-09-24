'use client'

// React Imports
import { useMemo, useState } from 'react'

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

// Local options (keep in sync with table)
const courierPlatforms = {
  none: { text: 'None' },
  leopard: { text: 'Leopards' },
  daewoo: { text: 'Daewoo' },
  postEx: { text: 'PostEx' },
  mp: { text: 'M&P' },
  tcs: { text: 'TCS' }
}

const EditCourierInfo = ({ open, setOpen, data, onSubmit }) => {
  const initial = useMemo(
    () => ({
      orderIds: data?.orderIds || [],
      courier: data?.courier || 'none',
      reason: data?.reason || ''
    }),
    [data]
  )

  const [form, setForm] = useState(initial)
  const [submitting, setSubmitting] = useState(false)

  const options = useMemo(
    () => Object.keys(courierPlatforms).map(key => ({ value: key, label: courierPlatforms[key].text })),
    []
  )

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
      console.log('form', form)
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
    } finally {
      // allow parent to call controls.done(); but ensure we don't leave it locked
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
                value={form.courier}
                onChange={e => setForm(prev => ({ ...prev, courier: e.target.value }))}
              >
                {options.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Reason'
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
