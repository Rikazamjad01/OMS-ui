import { useState } from 'react'

import { Chip, Menu, MenuItem } from '@mui/material'

import { statusChipColor, orderStatusArray } from '@/views/apps/ecommerce/orders/list/OrderListTable'

const StatusCell = ({ row, onStatusChange }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleStatusChange = newStatus => {
    // Call the parent handler with order ID and new status
    onStatusChange(row.original.id, newStatus)
    handleClose()
  }

  return (
    <>
      <Chip
        label={statusChipColor[row.original.status]?.text || row.original.status}
        color={statusChipColor[row.original.status]?.color || 'primary'}
        variant='tonal'
        size='small'
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      />

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {orderStatusArray.map(status => (
          <MenuItem key={status.value} onClick={() => handleStatusChange(status.value)}>
            <Chip
              label={status.label}
              color={statusChipColor[status.value]?.color || 'primary'}
              variant='tonal'
              size='small'
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default StatusCell
