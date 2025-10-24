// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const BookingOrderCard = ({ orderStats }) => {
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))

  // Map API response to stats array
  const statsData = [
    { key: 'total', title: 'Total Orders', icon: 'bx-calendar' },
    { key: 'confirmed', title: 'Confirmed Orders', icon: 'bx-check-double' },
    { key: 'processing', title: 'Processing Orders', icon: 'bx-hourglass' },
    { key: 'onWay', title: 'On Way Orders', icon: 'bx-car' }
  ].map(item => ({
    ...item,
    value: orderStats?.[item.key] ?? 0
  }))

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          {statsData.map((item, index) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              key={item.key}
              className={classnames({
                '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie':
                  isBelowMdScreen && !isBelowSmScreen,
                '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': !isBelowMdScreen
              })}
            >
              <div className='flex justify-between gap-4'>
                <div className='flex flex-col items-start'>
                  <Typography variant='h4'>{item.value.toLocaleString()}</Typography>
                  <Typography>{item.title}</Typography>
                </div>
                <CustomAvatar variant='rounded' size={42} skin='light'>
                  <i className={item.icon} />
                </CustomAvatar>
              </div>
              {isBelowMdScreen && !isBelowSmScreen && index < statsData.length - 2 && (
                <Divider
                  className={classnames('mbs-6', {
                    'mie-6': index % 2 === 0
                  })}
                />
              )}
              {isBelowSmScreen && index < statsData.length - 1 && <Divider className='mbs-6' />}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default BookingOrderCard
