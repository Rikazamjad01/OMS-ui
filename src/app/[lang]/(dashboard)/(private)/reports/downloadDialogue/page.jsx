'use client'

import { useState } from 'react'

import { Dialog, DialogContent, DialogActions, Typography, Button, MenuItem, TextField } from '@mui/material'

const DownloadDialog = ({ open, onClose, onConfirm }) => {
  const [format, setFormat] = useState('csv')

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
      <DialogContent className='flex flex-col gap-4'>
        <Typography variant='h6'>Choose Download Format</Typography>
        <TextField
          select
          label='Format'
          value={format}
          onChange={e => setFormat(e.target.value)}
          fullWidth
          size='small'
        >
          <MenuItem value='csv'>CSV</MenuItem>
          <MenuItem value='pdf'>PDF</MenuItem>
          <MenuItem value='excel'>Excel</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined' color='secondary'>
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm(format) // Pass chosen format
            onClose()
          }}
          variant='contained'
          color='primary'
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DownloadDialog
