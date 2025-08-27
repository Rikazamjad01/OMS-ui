"use client"

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Constants
import { paymentStatus, orderPlatform, statusChipColor, normalizePaymentMethod } from '../list/OrderListTable'

const FilterModal = ({
  open,
  onClose,
  onApply,
  initialFilters
}) => {
  const [filters, setFilters] = useState(initialFilters)
  const paymentMethod = normalizePaymentMethod()

  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters, open])

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const handleReset = () => {
    const emptyFilters = {
      order: '',
      date: '',
      customer: '',
      payment: '',
      platform: '',
      status: '',
      method: '',
      amount: '',
      city: '',
      tag: ''
    }

    setFilters(emptyFilters)
    onApply(emptyFilters)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Filter Orders</DialogTitle>
      <DialogContent className="grid grid-cols-2 gap-4 pt-4">
        <CustomTextField
          label="Order ID"
          value={filters.order || ''}
          onChange={e => handleChange('order', e.target.value)}
        />
        <CustomTextField
          label="Order Date"
          value={filters.date || ''}
          onChange={e => handleChange('date', e.target.value)}
        />
        <CustomTextField
          label="Customer Name"
          value={filters.customer || ''}
          onChange={e => handleChange('customer', e.target.value)}
        />
        <CustomTextField
          select
          label="Payment Status"
          value={filters.payment || ''}
          onChange={e => handleChange('payment', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {Object.keys(paymentStatus).map(payment => (
            <MenuItem key={payment} value={payment}>
              {paymentStatus[payment].text}
            </MenuItem>
          ))}
        </CustomTextField>

        <CustomTextField
          select
          label="Order Platform"
          value={filters.platform || ''}
          onChange={e => handleChange('platform', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {Object.keys(orderPlatform).map(platform => (
            <MenuItem key={platform} value={platform}>
              {orderPlatform[platform].text}
            </MenuItem>
          ))}
        </CustomTextField>

        <CustomTextField
          select
          label="Order Status"
          value={filters.status || ''}
          onChange={e => handleChange('status', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {Object.keys(statusChipColor).map(status => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </CustomTextField>

        <CustomTextField
          select
          label="Payment Method"
          value={filters.method || ''}
          onChange={e => handleChange('method', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {Object.keys(paymentMethod).map(method => (
            <MenuItem key={method} value={method}>
              {paymentMethod[method].text}
            </MenuItem>
          ))}
        </CustomTextField>

        <CustomTextField
          label="Amount Range"
          value={filters.amount || ''}
          onChange={e => handleChange('amount', e.target.value)}
        />

        <CustomTextField
          label="City"
          value={filters.city || ''}
          onChange={e => handleChange('city', e.target.value)}
        />

        <CustomTextField
          label="Tags"
          value={filters.tag || ''}
          onChange={e => handleChange('tag', e.target.value)}
        />
      </DialogContent>
      <DialogActions className="justify-between p-5">
        <Button onClick={handleReset} color="error" variant="tonal">
          Reset Filters
        </Button>
        <div className="flex gap-2">
          <Button onClick={onClose} color="secondary" variant="tonal">
            Cancel
          </Button>
          <Button onClick={handleApply} variant="contained">
            Apply Filters
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  )
}

export default FilterModal
