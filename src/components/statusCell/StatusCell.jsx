import { useEffect, useState } from 'react'

import { Chip, Menu, MenuItem } from '@mui/material'

import { statusChipColor, orderStatusArray } from '@/views/apps/ecommerce/orders/list/OrderListTable'
import { statusChipColorForBooking } from '../BookingOrder/BookingListTable'

const StatusCell = ({ row, onStatusChange, booking = false }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [statusArray, setStatusArray] = useState(orderStatusArray)
  const open = Boolean(anchorEl)
  const statusColor = statusChipColorForBooking

  useEffect(() => {
    let status = (row.original.status || '').toLowerCase()

    if (booking) {
      // Booking status logic
      if (status === 'confirmed') {
        setStatusArray([{ value: 'cancelled', label: 'Cancel' }])
      } else if (status === 'processing') {
        setStatusArray([{ value: 'onWay', label: 'On Way' }])
      } else if (status === 'onway') {
        setStatusArray([])
      } else {
        setStatusArray(
          Object.keys(statusChipColorForBooking).map(key => ({
            value: key,
            label: statusChipColorForBooking[key].text
          }))
        )
      }
    } else {
      // Regular order status logic
      if (status === 'pending') {
        setStatusArray(
          orderStatusArray.filter(s => s.value === 'confirmed' || s.value === 'cancelled' || s.value === 'noPick')
        )
      } else if (status.toLowerCase() === 'confirmed') {
        // setStatusArray(orderStatusArray.filter(s => s.value === 'onWay'))
        setStatusArray([])
      } else if (status === 'onway') {
        setStatusArray([])
      } else if (status === 'cancelled') {
        setStatusArray(orderStatusArray.filter(s => s.value === 'pending'))
      } else if (status.toLowerCase() === 'processing') {
        status = 'confirmed'
        setStatusArray([])
      } else if (status.toLowerCase() === 'nopick') {
        setStatusArray(orderStatusArray.filter(s => s.value === 'confirmed' || s.value === 'cancelled'))
      } else {
        setStatusArray(orderStatusArray)
      }
    }
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
            : statusChipColor[row.original.status === 'processing' ? 'confirmed' : row.original.status || '']?.text ||
              row.original.status
        }
        color={
          booking
            ? statusChipColorForBooking[row.original.status || '']?.color || 'primary'
            : statusChipColor[row.original.status === 'processing' ? 'confirmed' : row.original.status || '']?.color ||
              'primary'
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
