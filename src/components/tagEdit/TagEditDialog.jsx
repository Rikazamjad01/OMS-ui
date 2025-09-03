// TagEditDialog.jsx (or inline in OrderListTable file)
import { useEffect, useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'

export default function TagEditDialog({ open, initialTags = [], onClose, onSave }) {
  const [tags, setTags] = useState(initialTags || [])

  useEffect(() => {
    setTags(initialTags || [])
  }, [initialTags])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Edit Tags</DialogTitle>
      <DialogContent>
        <Autocomplete
          multiple
          freeSolo
          value={tags}  
          onChange={(e, value) => setTags(value)}
          options={[]} // you can pass suggestions here if you have them
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip variant='outlined' size='small' label={option} key={option + index} />
            ))
          }
          renderInput={params => (
            <TextField {...params} variant='outlined' label='Tags' placeholder='Type and press Enter to add' />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => {
            onSave(tags)
          }}
          variant='contained'
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
