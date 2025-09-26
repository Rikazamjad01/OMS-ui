import { useEffect, useState } from 'react'

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'

export default function TagEditDialog({ open, initialTags = [], onClose, onSave, loading }) {
  const [tag, setTag] = useState([])

  useEffect(() => {
    if (open) {
      setTag('')
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Edit Tag</DialogTitle>
      <DialogContent className='py-2 m-0'>
        <TextField
          id='outlined-basic'
          label='Tag'
          variant='outlined'
          value={tag}
          onChange={e => setTag(e.target.value)}
          placeholder='Type a tag'
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(tag)} variant='contained' disabled={loading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
