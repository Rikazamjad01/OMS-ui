import { useEffect, useState } from 'react'

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'

export default function TagEditDialog({ open, initialTags = [], onClose, onSave }) {
  const [tag, setTag] = useState([])

  useEffect(() => {
    if (open) {
      setTag([])
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Edit Tag</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          variant='outlined'
          label='Tag'
          value={tag}
          onChange={e => setTag(e.target.value)}
          placeholder='Type a tag'
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(tag)} variant='contained'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
