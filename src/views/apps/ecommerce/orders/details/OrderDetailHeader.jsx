'use client'

// MUI Imports
import { useEffect, useRef } from 'react'

import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

// Component Imports
import { useDispatch, useSelector } from 'react-redux'

import { handleFindOrder, selectSelectedProductIds } from '@/redux-store/slices/order'

import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

export const paymentStatus = {
  'paid': { text: 'Paid', color: 'success' },
  'pending': { text: 'Pending', color: 'warning' },
  'cancelled': { text: 'Cancelled', color: 'secondary' },
  'failed': { text: 'Failed', color: 'error' }
}

export const statusChipColor = {
  confirmed: { color: 'success' },
  completed: { color: 'primary' },
  processing: { color: 'info' },
  pending: { color: 'warning' },
  cancelled: { color: 'secondary' },
  delivered: { color: 'primary' },
  onWay: { color: 'warning' },
  returned: { color: 'error' }
}

const OrderDetailHeader = ({ order }) => {
  const { selectedOrders } = useSelector(state => state.orders)
  const selectedProductIds = useSelector(selectSelectedProductIds)
  const dispatch = useDispatch()

  const canSplitOrder = (() => {
    if (!selectedOrders?.line_items) return false

    const totalProducts = selectedOrders.line_items.length

    // User must select at least one product
    if (selectedProductIds.length < 1) return false

    if (totalProducts === 1) {
      // Only 1 product in the order → split allowed if quantity > 1
      const item = selectedOrders.line_items[0]

      return item?.quantity > 1
    }

    // Multiple products → split allowed if user selected any
    return true
  })()


  // Vars
  const buttonProps = (children, color, variant) => ({
    children,
    color,
    variant
  })

  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (order && isMounted.current) {
      dispatch(handleFindOrder(order))
    }
  }, [order, dispatch])

  return (
    <div className='flex flex-wrap justify-between sm:items-center max-sm:flex-col gap-y-4'>
      <div className='flex flex-col items-start gap-1'>
        <div className='flex items-center gap-2'>
          <Typography variant='h5'>{`Order ${order}`}</Typography>
          <Chip
            variant='tonal'
            label={selectedOrders?.orderStatus || 'Unknown'}
            color={statusChipColor[selectedOrders?.orderStatus || '']?.color || 'default'}
            size='small'
          />
          <Chip
            variant='tonal'
            label={paymentStatus[selectedOrders?.financial_status || 'pending']?.text}
            color={paymentStatus[selectedOrders?.financial_status || 'pending']?.color}
            size='small'
          />
        </div>
        <Typography>
          {selectedOrders?.created_at
            ? new Date(selectedOrders.created_at).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'Date not available'
          }
        </Typography>
      </div>
      <div className={'flex gap-2'}>
        <OpenDialogOnElementClick
          element={Button}
          elementProps={buttonProps('Cancel Order', 'error', 'tonal')}
          dialog={ConfirmationDialog}
          dialogProps={{ type: 'cancel-order' }}
        />

          <OpenDialogOnElementClick
            element={Button}
            elementProps={{
              ...buttonProps('Split Order', 'success', 'tonal'),
              disabled: !canSplitOrder
            }}
            dialog={ConfirmationDialog}
            dialogProps={{ type: 'split-order', payload: { orderIds: order, selectedProductIds } }}
          />

      </div>
    </div>
  )
}

export default OrderDetailHeader
