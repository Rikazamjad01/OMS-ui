import Image from 'next/image'

import { useSelector } from 'react-redux'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import EditUserInfo from '@components/dialogs/edit-user-info'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import { getInitials } from '@/utils/getInitials'
import { findCustomerById } from '@/redux-store/slices/customer'

const CustomerDetails = ({ customerData }) => {
  console.log(customerData, 'customerData in CustomerDetails')

  // Vars
  const buttonProps = {
    variant: 'contained',
    children: 'Edit Details'
  }

  // Calculate derived values
  const customerName = `${customerData?.customer?.first_name || ''} ${customerData?.customer?.last_name || ''}`.trim()
  const customerId = customerData?.customer?.id
  const totalOrders = customerData?.customer?.orders_count || 0
  const totalSpent = parseFloat(customerData?.customer?.total_spent || 0)
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

  // Get address information
  const address = customerData?.customer?.addresses?.[0] || {}
  const phone = address?.phone || 'Not available'
  const country = address?.country || 'Not available'

  const averageBasketValue = customerData?.stats?.average_line_items_size || 0

  return (
    <Card>
      <CardContent className='flex flex-col pbs-12 gap-6'>
        <div className='flex flex-col justify-self-center items-center gap-6'>
          <div className='flex flex-col items-center gap-4'>
            <CustomAvatar variant='rounded' alt='Customer Avatar' size={120}>
              {/* {getInitials(customerName)} */}
              <Image src={'https://res.cloudinary.com/dxxymlo0o/image/upload/v1758289042/default_it2w5u.png'} width={100} height={100} alt='default profile'/>
            </CustomAvatar>
            <div className='flex flex-col items-center text-center'>
              <Typography variant='h5'>{customerName || 'customer name not available'}</Typography>
              <Typography>Customer ID #{customerId}</Typography>
            </div>
          </div>
          <div className='grid grid-cols-2 items-center justify-around gap-4 is-full'>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='primary' size={40}>
                <i className='bx-cart' />
              </CustomAvatar>
              <div>
                <Typography variant='h6'>{totalOrders}</Typography>
                <Typography variant='body2'>Orders</Typography>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='primary' size={40}>
                <i className='bx-dollar' />
              </CustomAvatar>
              <div>
                <Typography variant='h6'>PKR {totalSpent.toLocaleString()}</Typography>
                <Typography variant='body2'>Spent</Typography>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='primary' size={40}>
                <i className='bx-basket' />
              </CustomAvatar>
              <div>
                <Typography variant='h6'>{averageBasketValue.toFixed(0)}</Typography>
                <Typography variant='body2'>Average Basket Size</Typography>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='primary' size={40}>
                <i className='bx-money' />
              </CustomAvatar>
              <div>
                <Typography variant='h6'>PKR {averageOrderValue.toFixed(0)}</Typography>
                <Typography variant='body2'>Average Order Value</Typography>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-4'>
          <Typography variant='h5'>Details</Typography>
          <Divider />
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-1'>
              <Typography variant='h6'>Name:</Typography>
              <Typography>{customerName || 'Not available'}</Typography>
            </div>
            <div className='flex items-center gap-1'>
              <Typography variant='h6'>Email:</Typography>
              <Typography>{customerData?.customer?.email || 'Not available'}</Typography>
            </div>
            <div className='flex items-center gap-1'>
              <Typography variant='h6'>Status:</Typography>
              <Chip
                label={totalOrders > 0 ? 'Active' : 'New'}
                variant='tonal'
                color={totalOrders > 0 ? 'success' : 'warning'}
                size='small'
              />
            </div>
            <div className='flex items-center gap-1'>
              <Typography variant='h6'>Contact:</Typography>
              <Typography>{phone}</Typography>
            </div>
            <div className='flex items-center gap-1'>
              <Typography variant='h6'>Country:</Typography>
              <Typography>{country}</Typography>
            </div>
          </div>
        </div>
        <OpenDialogOnElementClick
          element={Button}
          elementProps={buttonProps}
          dialog={EditUserInfo}
          dialogProps={{
            data: {
              firstName: customerData?.customer?.first_name || '',
              lastName: customerData?.customer?.last_name || '',
              email: customerData?.customer?.email || '',
              phone: phone,
              country: country,
              address1: address?.address1 || '',
              address2: address?.address2 || '',
              city: address?.city || '',
              state: address?.province || address?.state || '',
              zipCode: address?.zip || ''
            }
          }}
        />
      </CardContent>
    </Card>
  )
}

export default CustomerDetails
