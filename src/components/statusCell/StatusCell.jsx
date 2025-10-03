import { useEffect, useState } from 'react'

import { Chip, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'

import { statusChipColor, orderStatusArray } from '@/views/apps/ecommerce/orders/list/OrderListTable'
import { statusChipColorForBooking } from '../BookingOrder/BookingListTable'
import { toast } from 'react-toastify'

const StatusCell = ({ row, onStatusChange, booking = false }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [statusArray, setStatusArray] = useState(orderStatusArray)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)
  const open = Boolean(anchorEl)
  const statusColor = statusChipColorForBooking

  useEffect(() => {
    const status = (row.original.status || '').toLowerCase()

    if (booking) {
      // Booking status logic
      if (status === 'confirmed') {
        setStatusArray([])
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

  const handleSelectStatus = status => {
    setPendingStatus(status)
    handleClose()
    setConfirmOpen(true)
  }

  const handleConfirmStatusChange = () => {
    if (pendingStatus) {
      if (booking) {
        if (!row.original.awb) {
          setConfirmOpen(false)
          toast.error('Please assign the AWB first')
          setPendingStatus(null)
          return
        }
      }
      onStatusChange(row.original.id, pendingStatus.value)
    }
    setConfirmOpen(false)
    setPendingStatus(null)
  }

  const handleCancelStatusChange = () => {
    setConfirmOpen(false)
    setPendingStatus(null)
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
            <MenuItem key={status.value} onClick={() => handleSelectStatus(status)}>
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

      <Dialog open={confirmOpen} onClose={handleCancelStatusChange} maxWidth='xs' fullWidth>
        <DialogTitle>Confirm Status Update</DialogTitle>
        <DialogContent>
          Are you sure you want to change the status to
          {` ${pendingStatus?.label || ''}`}?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelStatusChange} variant='outlined' color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleConfirmStatusChange} variant='contained' color='primary'>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default StatusCell
