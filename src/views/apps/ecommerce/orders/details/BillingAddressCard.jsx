// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Component Imports
import AddAddress from '@components/dialogs/add-edit-address'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

const BillingAddress = ({ address }) => {
  // Vars
  const typographyProps = (children, color, className) => ({
    children,
    color,
    className
  })

  // Format the address data from the API
  const formatAddress = (addr) => {
    if (!addr) return 'No billing address available'

    const parts = [
      addr.address1,
      addr.address2,
      addr.city,
      addr.province || addr.state,
      addr.zip,
      addr.country_name || addr.country
    ].filter(part => part && part.trim() !== '')

    return parts.join(', ')
  }

  return (
    <Card>
      <CardContent className='flex flex-col gap-2'>
        <div className='flex flex-col gap-2'>
          <div className='flex justify-between items-center'>
            <Typography variant='h6'>Billing Address</Typography>
            {/* <OpenDialogOnElementClick
              element={Typography}
              elementProps={typographyProps('Edit', 'primary', 'cursor-pointer font-medium')}
              dialog={AddAddress}
              dialogProps={{
                type: 'Edit billing address',
                data: address ? {
                  country: address.country || address.country_name || '',
                  address1: address.address1 || '',
                  address2: address.address2 || '',
                  city: address.city || '',
                  state: address.province || address.state || '',
                  zipCode: address.zip || '',
                  contact: address.phone || ''
                } : {}
              }}
            /> */}
          </div>
          <div className='flex flex-col'>
            {address ? (
              <>
                <Typography variant='body2'>Street Address: {address.address1}</Typography>
                {address.address2 && (
                  <Typography variant='body2'>Address Line 2: {address.address2}</Typography>
                )}
                <Typography variant='body2'>City/Province: {[address.city, address.province, address.zip].filter(Boolean).join(', ')}
                </Typography>
                <Typography variant='body2'>Country: {address.country_name || address.country}</Typography>
                {address.phone && (
                  <Typography variant='body2'>Phone: {address.phone}</Typography>
                )}
              </>
            ) : (
              <Typography variant='body2'>No billing address available</Typography>
            )}
          </div>
        </div>
        {/* Payment method information - you might want to get this from your API */}
        <div className='flex flex-col items-start gap-1'>
          <Typography variant='h6'>Payment Method</Typography>
          <Typography variant='body2'>
            {address?.payment_method || 'Cash on Delivery (COD)'}
          </Typography>
          {address?.payment_method === 'Credit Card' && (
            <Typography variant='body2'>Card Number: ******4291</Typography>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default BillingAddress
