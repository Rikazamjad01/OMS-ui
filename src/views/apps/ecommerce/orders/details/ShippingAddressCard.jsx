// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Component Imports
import AddAddress from '@components/dialogs/add-edit-address'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

const ShippingAddress = ({ address }) => {
  // Vars
  const typographyProps = (children, color, className) => ({
    children,
    color,
    className
  })

  // Format the address data from the API
  const formatAddress = (addr) => {
    if (!addr) return 'No shipping address available'

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
        <div className='flex justify-between items-center'>
          <Typography variant='h6'>Shipping Address</Typography>
          <OpenDialogOnElementClick
            element={Typography}
            elementProps={typographyProps('Edit', 'primary', 'cursor-pointer font-medium')}
            dialog={AddAddress}
            dialogProps={{
              type: 'Edit shipping address',
              data: address ? {
                country: address.country || address.country_name || '',
                address1: address.address1 || '',
                address2: address.address2 || '',
                city: address.city || '',
                state: address.province || address.state || 'state',
                zipCode: address.zip || 'Zip code',
                contact: address.phone || ''
              } : {}
            }}
          />
        </div>
        <div className='flex flex-col'>
          {address ? (
            <>
              <Typography variant='body2'>Street Address: {address.address1}</Typography>
              {address.address2 && (
                <Typography variant='body2'>{address.address2}</Typography>
              )}
              <Typography variant='body2'> City/Province: {[address.city, address.province, address.zip].filter(Boolean).join(', ')}
              </Typography>
              <Typography variant='body2'>Country: {address.country_name || address.country}</Typography>
              {address.phone && (
                <Typography variant='body2'>Phone: {address.phone}</Typography>
              )}
            </>
          ) : (
            <Typography variant='body2'>No shipping address available</Typography>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ShippingAddress
