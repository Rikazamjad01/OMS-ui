import { useEffect, useState } from 'react'

import { Chip, Menu, MenuItem } from '@mui/material'

import { statusChipColor, orderStatusArray } from '@/views/apps/ecommerce/orders/list/OrderListTable'
import { statusChipColorForBooking } from '../BookingOrder/BookingListTable'
import { getStatusOptions } from '../statusOptions/statusOptions'

const StatusCell = ({ row, onStatusChange, booking = false }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [statusArray, setStatusArray] = useState(orderStatusArray)
  const open = Boolean(anchorEl)
  const statusColor = statusChipColorForBooking

  useEffect(() => {
    setStatusArray(getStatusOptions(row.original.status, booking))
  }, [row.original.status, booking])

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
        label={
          booking
            ? statusChipColorForBooking[row.original.status || '']?.text || row.original.status
            : statusChipColor[row.original.status || '']?.text || row.original.status
        }
        color={
          booking
            ? statusChipColorForBooking[row.original.status || '']?.color || 'primary'
            : statusChipColor[row.original.status || '']?.color || 'primary'
        }
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
                color={statusChipColor[status.value || '']?.color || 'primary'}
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
