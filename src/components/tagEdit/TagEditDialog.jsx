import { useEffect, useState } from 'react'

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem } from '@mui/material'

export default function TagEditDialog({ open, initialTags = [], onClose, onSave, loading }) {
  const [tag, setTag] = useState('')

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
          select
          fullWidth
        >
          <MenuItem value='' disabled>
            Select a tag
          </MenuItem>
          <MenuItem value='Urgent delivery'>Urgent delivery</MenuItem>
          <MenuItem value='Allowed to Open'>Allowed to Open</MenuItem>
          <MenuItem value='Deliver between (specific date and Time)'>Deliver between (specific date and Time)</MenuItem>
          <MenuItem value='Call before reaching'>Call before reaching</MenuItem>
          <MenuItem value='Deliver parcel to the  (specific person)'>Deliver parcel to the (specific person)</MenuItem>
          <MenuItem value='Do not deliver to anyone except the mentioned consignee name'>
            Do not deliver to anyone except the mentioned consignee name
          </MenuItem>
          <MenuItem value='Deliver without call'>Deliver without call</MenuItem>
          <MenuItem value='Product must not be visible-consider privacy'>
            Product must not be visible-consider privacy
          </MenuItem>
        </TextField>
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
