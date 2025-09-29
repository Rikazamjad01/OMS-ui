import { useEffect, useState } from 'react'

import { Chip, Menu, MenuItem } from '@mui/material'

import { statusChipColor, orderStatusArray } from '@/views/apps/ecommerce/orders/list/OrderListTable'

const StatusCell = ({ row, onStatusChange }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [statusArray, setStatusArray] = useState(orderStatusArray)
  const open = Boolean(anchorEl)
  useEffect(() => {
    if (row.original.status.toLowerCase() == 'pending') {
      setStatusArray(
        orderStatusArray.filter(
          status => status.value == 'confirmed' || status.value == 'processing' || status.value == 'cancelled'
        )
      )
    }
    if (row.original.status.toLowerCase() == 'confirmed') {
      setStatusArray(orderStatusArray.filter(status => status.value == 'onWay' || status.value == 'processing'))
    }
    if (row.original.status.toLowerCase() == 'processing') {
      setStatusArray(orderStatusArray.filter(status => status.value == 'onWay'))
    }
    if (row.original.status.toLowerCase() == 'cancelled') {
      setStatusArray(orderStatusArray.filter(status => status.value == 'pending'))
    }
  }, [row.original.status])
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
        // color={'black'}
        color={statusChipColor[row.original.status]?.color || 'primary'}
        variant='tonal'
        size='small'
        className='text-black'
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      />

      {statusArray.length > 0 && (
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          {statusArray.map(status => (
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
      )}
    </>
  )
}

export default StatusCell
