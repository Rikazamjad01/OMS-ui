'use client'

// React Imports
import { Fragment, useState, useEffect } from 'react'

// MUI Imports
import Image from 'next/image'

import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'

// API Imports
import { useDispatch } from 'react-redux'

import { mergeOrders, splitOrder } from '@/utils/api'
import { splitOrderProductSetting } from '@/redux-store/slices/order'

const ConfirmationDialog = ({ open, setOpen, type, payload, onSuccess, onError }) => {
  // States
  const [secondDialog, setSecondDialog] = useState(false)
  const [userInput, setUserInput] = useState(false) // true = user confirmed; false = cancelled or failed
  const [resultTitle, setResultTitle] = useState(null)
  const [resultSubtitle, setResultSubtitle] = useState(null)

  const dispatch = useDispatch()

  // Split order quantities
  const [quantities, setQuantities] = useState({})
  const isMerge = type === 'merge-orders' || type === 'merge-order'
  const isSplit = type === 'split-order'
  const Wrapper = type === 'suspend-account' ? 'div' : Fragment

  // Initialize quantities when dialog opens
  useEffect(() => {
    if (isSplit && open && payload?.selectedLineItems) {
      const initial = {}

      console.log(payload?.selectedLineItems, 'selectedLineItems')

      payload.selectedLineItems.forEach(item => {
        initial[item.id] = item.quantity // start with full qty
      })
      setQuantities(initial)
    }
  }, [isSplit, open, payload])

  const handleSecondDialogClose = () => {
    setSecondDialog(false)
    setResultTitle(null)
    setResultSubtitle(null)
    setOpen(false)
  }

  const handleConfirmation = async value => {
    // Close the first dialog either way
    setOpen(false)

    if (!value) {
      setUserInput(false)
      setResultTitle(null)
      setResultSubtitle(null)
      setSecondDialog(true)

      return
    }

    try {
      if (isMerge) {
        const ids = payload?.orderIds ?? []

        if (ids.length < 2) throw new Error('Please select at least 2 orders to merge.')
        await mergeOrders(ids)
      } else if (isSplit) {
        const orderId = payload?.orderIds
        const selectedLineItems = payload?.selectedLineItems ?? []

        if (!orderId) throw new Error('Order ID is required for splitting.')
        if (selectedLineItems.length === 0) throw new Error('Please select at least 1 product to split.')

        const itemsWithQuantities = selectedLineItems.map(item => ({
          ...item,
          splitQuantity: quantities[item.id]
        }))

        if (itemsWithQuantities.some(i => !i.splitQuantity || i.splitQuantity < 1)) {
          throw new Error('Please set valid quantities for all items.')
        }

        const response = await splitOrder(orderId, itemsWithQuantities)

        if (response.status) {
          dispatch(splitOrderProductSetting(response))
        }
      }

      // Success
      setUserInput(true)
      setResultTitle(null)
      setResultSubtitle(null)
      setSecondDialog(true)
      onSuccess?.()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.'

      setUserInput(false)
      setResultTitle('Action Failed')
      setResultSubtitle(msg)
      setSecondDialog(true)
      onError?.(err)
    }
  }

  // Title messages
  const getConfirmationTitle = () => {
    switch (type) {
      case 'split-order':
        return 'Adjust quantities for split'
      case 'merge-order':
      case 'merge-orders':
        return 'Are you sure to merge these orders?'
      case 'cancel-order':
        return 'Are you sure to cancel order?'
      case 'delete-order':
        return 'Are you sure to delete this order?'
      case 'delete-customer':
        return 'Are you sure to delete this customer?'
      case 'delete-account':
        return 'Are you sure you want to deactivate your account?'
      case 'unsubscribe':
        return 'Are you sure to cancel your subscription?'
      case 'suspend-account':
        return 'Are you sure?'
      case 'duplicate-order':
        return 'Are you sure to duplicate this order?'
      default:
        return 'Are you sure?'
    }
  }

  // Button labels
  const getConfirmButtonLabel = () => {
    switch (type) {
      case 'split-order':
        return 'Yes, Split Order!'
      case 'merge-orders':
      case 'merge-order':
        return 'Yes, Merge Orders!'
      case 'cancel-order':
        return 'Yes, Cancel Order!'
      case 'delete-order':
        return 'Yes, Delete Order!'
      case 'delete-customer':
        return 'Yes, Delete Customer!'
      case 'suspend-account':
        return 'Yes, Suspend User!'
      case 'duplicate-order':
        return 'Yes, Duplicate Order!'
      default:
        return 'Yes'
    }
  }

  // Result titles & subtitles
  const getResultTitle = () => {
    if (!userInput) return 'Cancelled'

    switch (type) {
      case 'split-order':
        return 'Split Completed'
      case 'merge-orders':
      case 'merge-order':
        return 'Merged Successfully'
      case 'cancel-order':
        return 'Order Cancelled'
      case 'delete-order':
        return 'Deleted'
      case 'delete-customer':
        return 'Deleted'
      case 'suspend-account':
        return 'Suspended!'
      case 'delete-account':
        return 'Deactivated'
      case 'unsubscribe':
        return 'Unsubscribed'
      case 'duplicate-order':
        return 'Duplicated Successfully'
      default:
        return 'Done'
    }
  }

  const getResultSubtitle = () => {
    if (userInput) {
      switch (type) {
        case 'split-order':
          return 'Order has been split successfully.'
        case 'merge-orders':
        case 'merge-order':
          return 'Orders merged successfully.'
        case 'cancel-order':
          return 'Your order has been cancelled successfully.'
        case 'delete-order':
          return 'Your order deleted successfully.'
        case 'delete-customer':
          return 'Your customer removed successfully.'
        case 'suspend-account':
          return 'User has been suspended.'
        case 'delete-account':
          return 'Your account has been deactivated successfully.'
        case 'unsubscribe':
          return 'Your subscription cancelled successfully.'
        case 'duplicate-order':
          return 'Order duplicated successfully.'
        default:
          return 'Operation completed successfully.'
      }
    } else {
      switch (type) {
        case 'split-order':
          return 'Order Split Cancelled'
        case 'merge-orders':
        case 'merge-order':
          return 'Order Merge Cancelled'
        case 'cancel-order':
          return 'Order Cancellation Cancelled'
        case 'delete-order':
          return 'Order Deletion Cancelled'
        case 'delete-customer':
          return 'Customer Deletion Cancelled'
        case 'suspend-account':
          return 'Suspension Cancelled :)'
        case 'delete-account':
          return 'Account Deactivation Cancelled!'
        case 'unsubscribe':
          return 'Unsubscription Cancelled!'
        case 'duplicate-order':
          return 'Order Duplication Cancelled'
        default:
          return 'Action Cancelled'
      }
    }
  }

  return (
    <>
      {/* First confirmation dialog */}
      <Dialog fullWidth maxWidth='sm' open={open} onClose={() => setOpen(false)} closeAfterTransition={false}>
        <DialogContent className='flex flex-col gap-6 text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i className='bx-error-circle text-[64px] text-warning mx-auto' />
          <Wrapper>
            <Typography variant='h4' gutterBottom>
              {getConfirmationTitle()}
            </Typography>

            {/* Split order quantity stepper */}
            {isSplit && payload?.selectedLineItems?.length > 0 && (
              <div className='flex flex-col gap-4 mt-4'>
                {payload.selectedLineItems.map(item => (
                  <div
                    key={item.id}
                    className='flex flex-col justify-between items-center border rounded-lg px-4 py-2 shadow-sm'
                  >
                    <div className='text-center mb-4'>
                      <div className='flex space-x-2 my-2 items-center'>
                        <Image src={item.img} alt={item.name || `Item #${item.id}`} width={40} height={40} />
                        <Typography variant='body1' fontWeight='bold'>
                          {item.name || `Item #${item.id}`}
                        </Typography>
                      </div>
                      <Typography variant='h5' color='text.secondary'>
                        Available Items: {item.quantity}
                      </Typography>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={() =>
                          setQuantities(prev => ({
                            ...prev,
                            [item.id]: Math.max(1, prev[item.id] - 1)
                          }))
                        }
                        disabled={quantities[item.id] <= 1}
                        className='text-2xl'
                      >
                        <i className='bx-minus' />
                      </Button>
                      <Typography variant='body1'>{quantities[item.id]}</Typography>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={() =>
                          setQuantities(prev => ({
                            ...prev,
                            [item.id]: Math.min(item.quantity, prev[item.id] + 1)
                          }))
                        }
                        disabled={quantities[item.id] >= item.quantity}
                        className='text-2xl'
                      >
                        <i className='bx-plus' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Wrapper>
        </DialogContent>
        <DialogActions className='flex justify-center gap-4 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' onClick={() => handleConfirmation(true)} className='max-sm:is-full'>
            {getConfirmButtonLabel()}
          </Button>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => handleConfirmation(false)}
            className='max-sm:is-full'
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Second result dialog */}
      <Dialog open={secondDialog} onClose={handleSecondDialogClose} closeAfterTransition={false}>
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i
            className={classnames('text-[88px] mbe-6', {
              'bx-check-circle': userInput,
              'text-success': userInput,
              'bx-x-circle': !userInput,
              'text-error': !userInput
            })}
          />
          <Typography variant='h4' className='mbe-2'>
            {resultTitle ?? getResultTitle()}
          </Typography>
          <Typography color='text.primary'>{resultSubtitle ?? getResultSubtitle()}</Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' color='success' onClick={handleSecondDialogClose}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ConfirmationDialog
