'use client'

// MUI Imports
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Component Imports
// import { useSelector } from 'react-redux'

import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

// Redux Imports

const CustomerDetailHeader = ({ customerData }) => {
  // Get customer data from Redux store
  // const { selectedOrders } = useSelector(state => state.orders)

  // const customerData = selectedOrders?.customerData || {}

  // Vars
  const buttonProps = (children, color, variant) => ({
    children,
    color,
    variant
  })

  // Format the customer name
  const customerName = `${customerData?.customer?.first_name || ''} ${customerData?.customer?.last_name || ''}`.trim()

  // const customerId = customerData?.id || 'N/A'

  // Use the order creation date as a proxy for customer join date
  const joinDate = new Date(customerData?.customer?.created_at).toLocaleDateString()

  return (
    <div className='flex flex-wrap justify-between max-sm:flex-col sm:items-center gap-x-6 gap-y-4'>
      <div className='flex flex-col items-start gap-1'>
        <Typography variant='h4'>{`Customer ID #${customerData?.customer?.id}`}</Typography>
        <Typography>Member since: {joinDate}</Typography>
      </div>
      <OpenDialogOnElementClick
        element={Button}
        elementProps={buttonProps('Delete Customer', 'error', 'tonal')}
        dialog={ConfirmationDialog}
        dialogProps={{ type: 'delete-customer' }}
      />
    </div>
  )
}

export default CustomerDetailHeader
