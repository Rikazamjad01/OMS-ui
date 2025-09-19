'use client'

import { useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { useSelector, useDispatch } from 'react-redux'

import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import { fetchOrderById, selectSelectedProductIds, updateOrdersStatusThunk } from '@/redux-store/slices/order'
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

const OrderDetailHeader = ({ order: initialOrder, id }) => {
  const selectedProductIds = useSelector(selectSelectedProductIds)
  const dispatch = useDispatch()
  const { lang: locale } = useParams()
  const router = useRouter()

  const [order, setOrder] = useState(initialOrder) // 👈 local state copy

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: 'Hello everyonwedfad',
    severity: 'success'
  })

  if (!order) return null

  const canSplitOrder = (() => {
    if (!order.line_items) return false

    if (order.line_items.length === 1) {
      return order.line_items[0]?.quantity > 1
    }

    return order.line_items.length > 1
  })()

  const handleCancelOrder = async () => {
    try {
      const response = await dispatch(
        updateOrdersStatusThunk({
          orderIds: [order.id],
          status: 'cancelled'
        })
      ).unwrap()

      if(response.status){

        setOrder(prev => ({ ...prev, orderStatus: 'cancelled' }))

        setSnackbar({
          open: true,
          message: 'Order cancelled successfully',
          severity: 'success'
        })
      }

      dispatch(fetchOrderById(id))

      // dispatch(fetchOrders({ page: pagination.page, limit: pagination.limit }))
    } catch (err) {
      // console.error('Cancel failed:', err)
      setSnackbar({
        open: true,
        message: 'Failed to cancel order: ' + (err.message || 'Unknown error'),
        severity: 'error'
      })
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <>
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
          {/* 👇 Hide Cancel Order button if already cancelled */}
          {order?.orderStatus !== 'cancelled' && (
            <Button color='error' variant='tonal' onClick={handleCancelOrder}>
              Cancel Order
            </Button>
          )}

          <OpenDialogOnElementClick
            element={Button}
            elementProps={{
              children: 'Split Order',
              color: 'success',
              variant: 'tonal',
              disabled: !canSplitOrder || selectedProductIds.length === 0
            }}
            dialog={ConfirmationDialog}
            dialogProps={{
              type: 'split-order',
              payload: {
                orderIds: order.id,
                selectedLineItems: selectedProductIds?.map(id => {
                  const product = order?.line_items?.find(item => item.id === id)
                  const prodName = order?.products?.find(item => item.id === id) || {}

                  return {
                    id: product?.id,
                    quantity: product?.quantity,
                    name: prodName?.title,
                    img: prodName?.image?.src,
                    prodVarientId: product?.variant_id
                  }
                })
              }
            }}
          />
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant='filled' sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default OrderDetailHeader
