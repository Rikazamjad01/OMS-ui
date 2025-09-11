'use client'

// MUI Imports

import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

// Component Imports
import { useSelector } from 'react-redux'

import { selectSelectedProductIds } from '@/redux-store/slices/order'

import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import { selectSelectedProducts } from '@/redux-store/slices/products'

export const paymentStatus = {
  paid: { text: 'Paid', color: 'success' },
  pending: { text: 'Pending', color: 'warning' },
  cancelled: { text: 'Cancelled', color: 'secondary' },
  failed: { text: 'Failed', color: 'error' }
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

const OrderDetailHeader = ({ order, id }) => {
  const selectedProductIds = useSelector(selectSelectedProductIds)
  const selectedProducts = useSelector(selectSelectedProducts)

  console.log(order, 'orderrrrrrrrrr');

  if (!order) return null

  const canSplitOrder = (() => {
    if (!order.line_items) return false

    const totalProducts = order.line_items.length

    // User must select at least one product (if you keep a selection mechanism)
    // For now, let's allow splitting if there's more than 1 product or quantity > 1
    if (totalProducts === 1) {
      const item = order.line_items[0]

      return item?.quantity > 1
    }

    return totalProducts > 1
  })()

  // Vars
  const buttonProps = (children, color, variant) => ({
    children,
    color,
    variant
  })

  return (
    <div className='flex flex-wrap justify-between sm:items-center max-sm:flex-col gap-y-4'>
      <div className='flex flex-col items-start gap-1'>
        <div className='flex items-center gap-2'>
          <Typography variant='h5'>{`Order ${id}`}</Typography>
          <Chip
            variant='tonal'
            label={order?.orderStatus || 'Unknown'}
            color={statusChipColor[order?.orderStatus || '']?.color || 'default'}
            size='small'
          />
          <Chip
            variant='tonal'
            label={paymentStatus[order?.financial_status || 'pending']?.text}
            color={paymentStatus[order?.financial_status || 'pending']?.color}
            size='small'
          />
        </div>
        <Typography>
          {order?.created_at
            ? new Date(order.created_at).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'Date not available'}
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
            disabled: !canSplitOrder || selectedProductIds.length === 0
          }}
          dialog={ConfirmationDialog}
          dialogProps={{
            type: 'split-order',
            payload: {
              orderIds: order.id,
              selectedLineItems: selectedProductIds.map(id => {
                const product = order.line_items.find(item => item.id === id)
                const prodName = order?.products.find(item => item.id === id)

                return {
                  id: product.id,
                  quantity: product.quantity,
                  name: prodName.title,
                  img: prodName.image.src,
                }
              })
            }
          }}
        />
      </div>
    </div>
  )
}

export default OrderDetailHeader
