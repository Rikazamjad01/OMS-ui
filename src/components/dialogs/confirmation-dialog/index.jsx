'use client'

// React Imports
import { Fragment, useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'

const ConfirmationDialog = ({ open, setOpen, type }) => {
  // States
  const [secondDialog, setSecondDialog] = useState(false)
  const [userInput, setUserInput] = useState(false)

  // Vars
  const Wrapper = type === 'suspend-account' ? 'div' : Fragment

  const handleSecondDialogClose = () => {
    setSecondDialog(false)
    setOpen(false)
  }

  const handleConfirmation = value => {
    setUserInput(value)
    setSecondDialog(true)
    setOpen(false)
  }

  // Title messages for first dialog
  const getConfirmationTitle = () => {
    switch (type) {
      case 'delete-account':
        return 'Are you sure you want to deactivate your account?'
      case 'unsubscribe':
        return 'Are you sure to cancel your subscription?'
      case 'suspend-account':
        return 'Are you sure?'
      case 'cancel-order':
        return 'Are you sure to cancel order?'
      case 'split-order':
        return 'Are you sure to split this order?'
      case 'merge-order':
        return 'Are you sure to merge these orders?'
      case 'duplicate-order':
        return 'Are you sure to duplicate this order?'
      case 'delete-order':
        return 'Are you sure to delete this order?'
      case 'delete-customer':
        return 'Are you sure to delete this customer?'
      default:
        return 'Are you sure?'
    }
  }

  // Warning subtitles for irreversible actions
  const getWarningSubtitle = () => {
    switch (type) {
      case 'suspend-account':
        return "You won't be able to revert user!"
      case 'delete-order':
        return "You won't be able to revert order!"
      case 'delete-customer':
        return "You won't be able to revert customer!"
      default:
        return null
    }
  }

  // Button labels for confirm button
  const getConfirmButtonLabel = () => {
    switch (type) {
      case 'suspend-account':
        return 'Yes, Suspend User!'
      case 'delete-order':
        return 'Yes, Delete Order!'
      case 'delete-customer':
        return 'Yes, Delete Customer!'
      case 'split-order':
        return 'Yes, Split Order!'
      case 'merge-orders':
        return 'Yes, Merge orders!'
      case 'duplicate-order':
        return 'Yes, Duplicate Order!'
      case 'cancel-order':
        return 'Yes, Cancel Order!'
      default:
        return 'Yes'
    }
  }

  // Result title for second dialog
  const getResultTitle = () => {
    if (!userInput) return 'Cancelled'

    switch (type) {
      case 'delete-account':
        return 'Deactivated'
      case 'unsubscribe':
        return 'Unsubscribed'
      case 'suspend-account':
        return 'Suspended!'
      case 'delete-order':
        return 'Deleted'
      case 'delete-customer':
        return 'Deleted'
      case 'split-order':
        return 'Split Completed'
      case 'merge-orders':
        return 'Merged Successfully'
      case 'duplicate-order':
        return 'Duplicated Successfully'
      case 'cancel-order':
        return 'Order Cancelled'
      default:
        return 'Done'
    }
  }

  // Result subtitle for second dialog
  const getResultSubtitle = () => {
    if (userInput) {
      switch (type) {
        case 'delete-account':
          return 'Your account has been deactivated successfully.'
        case 'unsubscribe':
          return 'Your subscription cancelled successfully.'
        case 'suspend-account':
          return 'User has been suspended.'
        case 'delete-order':
          return 'Your order deleted successfully.'
        case 'delete-customer':
          return 'Your customer removed successfully.'
        case 'split-order':
          return 'Order has been split successfully.'
        case 'merge-orders':
          return 'Orders merged successfully.'
        case 'duplicate-order':
          return 'Order duplicated successfully.'
        case 'cancel-order':
          return 'Your order has been cancelled successfully.'
        default:
          return 'Operation completed successfully.'
      }
    } else {
      switch (type) {
        case 'delete-account':
          return 'Account Deactivation Cancelled!'
        case 'unsubscribe':
          return 'Unsubscription Cancelled!'
        case 'suspend-account':
          return 'Suspension Cancelled :)'
        case 'delete-order':
          return 'Order Deletion Cancelled'
        case 'delete-customer':
          return 'Customer Deletion Cancelled'
        case 'split-order':
          return 'Order Split Cancelled'
        case 'merge-orders':
          return 'Order Merge Cancelled'
        case 'duplicate-order':
          return 'Order Duplication Cancelled'
        case 'cancel-order':
          return 'Order Cancellation Cancelled'
        default:
          return 'Action Cancelled'
      }
    }
  }

  return (
    <>
      {/* First confirmation dialog */}
      <Dialog fullWidth maxWidth='xs' open={open} onClose={() => setOpen(false)} closeAfterTransition={false}>
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i className='bx-error-circle text-[88px] mbe-6 text-warning' />
          <Wrapper
            {...(type === 'suspend-account' && {
              className: 'flex flex-col items-center gap-2'
            })}
          >
            <Typography variant='h4'>{getConfirmationTitle()}</Typography>
            {getWarningSubtitle() && <Typography color='text.primary'>{getWarningSubtitle()}</Typography>}
          </Wrapper>
        </DialogContent>
        <DialogActions className='max-sm:flex-col max-sm:gap-4 justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' onClick={() => handleConfirmation(true)} className='max-sm:is-full'>
            {getConfirmButtonLabel()}
          </Button>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => handleConfirmation(false)}
            className='max-sm:mis-0 max-sm:is-full'
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
            {getResultTitle()}
          </Typography>
          <Typography color='text.primary'>{getResultSubtitle()}</Typography>
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
