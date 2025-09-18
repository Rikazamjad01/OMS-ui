'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import { Box } from '@mui/material'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import EditUserInfo from '@components/dialogs/edit-user-info'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import ShippingAddress from './ShippingAddressCard'
import BillingAddress from './BillingAddressCard'


const getAvatar = params => {
  const { avatar, customer } = params

  if (avatar) {
    return <CustomAvatar size={40} src={avatar} />
  } else {
    return <CustomAvatar size={40}  className='cursor-pointer bg-primary text-white'>{getInitials(customer)}</CustomAvatar>
  }
}

const CustomerDetails = ({ order }) => {

  // Vars
  const typographyProps = (children, color, className) => ({
    children,
    color,
    className
  })

  if (!order) {
    return <div>Loading customer details...</div>
  }

  const customer = order.customer
  const customerName = `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim()

  return (
    <Card>
      <div>
        <CardContent className='flex flex-col gap-6'>
          <Typography variant='h5'>Customer details</Typography>
          <div className='flex items-center gap-3'>
            {getAvatar({
              avatar: '',
              customer: customerName || 'Unknown Customer'
            })}
            <div className='flex flex-col'>
              <Typography variant='h6'>{customerName || 'Unknown Customer'}</Typography>
              <Typography>Customer ID: #{customer?.id || 'N/A'}</Typography>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {/* Orders Summary */}
            <Grid container columnSpacing={8} rowSpacing={2} alignItems={'center'} columns={2}>
            <div className='grid grid-cols-2 w-full gap-8'>
              <div className='space-y-2'>
                {/* Total Orders */}
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <CustomAvatar skin="light" color="primary" size={22}>
                      <i className="bx bx-cart" />
                    </CustomAvatar>
                    <Typography variant="body2">
                      {customer.orders_count || 0} Orders
                    </Typography>
                  </Box>
                </Grid>

                {/* Successful Orders */}
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <CustomAvatar skin="light" color="success" size={22}>
                      <i className="bx bx-check-circle" />
                    </CustomAvatar>
                    <Typography variant="body2">
                      {customer.confirmedOrders || 0} Successful
                    </Typography>
                  </Box>
                </Grid>
              </div>
              <div className='space-y-2'>
                {/* Cancelled Orders */}
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <CustomAvatar skin="light" color="error" size={22}>
                      <i className="bx bx-x-circle" />
                    </CustomAvatar>
                    <Typography variant="body2">
                      {customer.cancelledOrders || 0} Cancelled
                    </Typography>
                  </Box>
                </Grid>

                {/* Pending Orders */}
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <CustomAvatar skin="light" color="warning" size={22}>
                      <i className="bx bx-time-five" />
                    </CustomAvatar>
                    <Typography variant="body2">
                      {customer.pendingOrders || 0} Pending
                    </Typography>
                  </Box>
                </Grid>
              </div>
            </div>

            </Grid>
          </div>
          <div className='flex flex-col gap-1'>
            <div className='flex justify-between items-center'>
              <Typography variant='h6'>Contact info</Typography>
              <OpenDialogOnElementClick
                element={Typography}
                elementProps={typographyProps('Edit', 'primary', 'cursor-pointer font-medium')}
                dialog={EditUserInfo}
                dialogProps={{
                  data: {
                    firstName: customer?.first_name || '',
                    lastName: customer?.last_name || '',
                    email: order.email || '',
                    phone: customer?.addresses?.[0]?.phone || '',
                    country: customer?.addresses?.[0]?.country || '',
                    city: customer?.addresses?.[0]?.city || '',
                    address1: customer?.addresses?.[0]?.address1 || '',
                    address2: customer?.addresses?.[0]?.address2 || ''
                  }
                }}
              />
            </div>
            <Typography variant='body2'>Email: {order.email || 'N/A'}</Typography>
            <Typography variant='body2'>
              Mobile: {customer?.addresses?.[0]?.phone || 'N/A'}
            </Typography>
          </div>
        </CardContent>

        <ShippingAddress address={customer?.addresses?.[0]} />
        <BillingAddress address={customer?.addresses?.[0]} />
      </div>
    </Card>
  )
}

export default CustomerDetails
