'use client'

import { Box, TextField, IconButton, MenuItem, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

const SlabRow = ({ index, slab, onChange, onRemove, incentiveAmount }) => {
  const handleChange = (field, value) => {
    const updated = { ...slab, [field]: value }

    // reset value when type is base
    if (field === 'type' && value === 'base') updated.value = ''
    onChange(index, updated)
  }

  // live validation — min must not exceed max
  const isInvalidRange =
    slab.min !== '' && slab.max !== '' && Number(slab.min) > Number(slab.max)

  const totalIncentive = () => {
    const amount = Number(incentiveAmount) || 0
    const val = Number(slab.value) || 0

    switch (slab.type) {
      case 'deduct':
        return amount - (amount * val) / 100
      case 'bonus':
        return amount + (amount * val) / 100
      case 'base':
        return amount
      default:
        return 0
    }
  }

  return (
    <Box
      display='flex'
      alignItems='center'
      justifyContent='space-between'
      gap={2}
      mb={2}
      flexWrap='wrap'
      sx={{ border: '1px solid #ddd', borderRadius: 1, p: 3, mt: 2}}
    >
      <Typography sx={{ fontWeight: 600 }}>Slab {index + 1}</Typography>

      <div className='flex gap-5 mx-5'>
        <TextField
          label='Min %'
          type='number'
          size='small'
          value={slab.min}
          onChange={e => handleChange('min', e.target.value)}
          sx={{ width: 150 }}
          error={isInvalidRange}
          helperText={isInvalidRange ? 'Min % cannot exceed Max %' : ''}
        />

        <TextField
          label='Max %'
          type='number'
          size='small'
          value={slab.max}
          onChange={e => handleChange('max', e.target.value)}
          sx={{ width: 150 }}
          error={isInvalidRange}
          helperText={isInvalidRange ? 'Max % must be greater than Min %' : ''}
        />

        <TextField
          select
          label='Type'
          size='small'
          value={slab.type}
          onChange={e => handleChange('type', e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value='deduct'>Deduct %</MenuItem>
          <MenuItem value='base'>Base</MenuItem>
          <MenuItem value='bonus'>Add Fixed Bonus</MenuItem>
        </TextField>

        {slab.type !== 'base' && (
          <TextField
            label={slab.type === 'deduct' ? 'Value (%)' : 'Bonus %'}
            type='number'
            size='small'
            value={slab.value}
            onChange={e => handleChange('value', e.target.value)}
            sx={{ width: 200 }}
          />
        )}
      </div>

      <Typography sx={{ flex: 1 }}>
        {incentiveAmount && !isInvalidRange ? totalIncentive().toFixed(2) : '-'}
      </Typography>

      <IconButton color='error' onClick={() => onRemove(index)}>
        <DeleteIcon />
      </IconButton>
    </Box>
  )
}

export default SlabRow
