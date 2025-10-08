// src/utils/getStatusOptions.js

import { statusChipColor, orderStatusArray } from '@/views/apps/ecommerce/orders/list/OrderListTable'
import { statusChipColorForBooking } from '@/components/BookingOrder/BookingListTable'

export function getStatusOptions(currentStatus, booking = false) {
  const status = (currentStatus || '').toLowerCase()

  if (booking) {
    if (status === 'confirmed') return []
    if (status === 'processing') return [{ value: 'onWay', label: 'On Way' }]
    if (status === 'onway') return []

    return Object.keys(statusChipColorForBooking).map(key => ({
      value: key,
      label: statusChipColorForBooking[key].text
    }))
  } else {
    if (status === 'pending')
      return orderStatusArray.filter(s => s.value === 'confirmed' || s.value === 'cancelled' || s.value === 'noPick')
    if (status === 'confirmed') return []
    if (status === 'onway') return []
    if (status === 'cancelled') return orderStatusArray.filter(s => s.value === 'pending')
    if (status === 'processing') return []
    if (status === 'nopick')
      return orderStatusArray.filter(s => s.value === 'confirmed' || s.value === 'cancelled')

    return orderStatusArray
  }
}
