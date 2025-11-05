// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'

// Component Imports
import { LinearProgress } from '@mui/material'
import OptionMenu from '@core/components/option-menu'

// Vars
const data = [
  {
    imgSrc: '/images/cards/paypal-error-bg.png',
    subtitle: 'Cash On Delivery',
    title: 'Received cash',
    amount: 82.6,
    percentage: 75,
    color: 'error'
  },
  {
    imgSrc: '/images/cards/wallet-success-bg.png',
    subtitle: 'Jazz Cash',
    title: 'Received through Jazz Cash',
    amount: 270.69,
    percentage: 50,
    color: 'success',
  },
  {
    imgSrc: '/images/cards/chart-info-bg.png',
    subtitle: 'Easy Paisa',
    title: 'Received through Easy Paisa',
    amount: 637.91,
    percentage: 30,
    color: 'info',
  },
  {
    imgSrc: '/images/cards/credit-card-primary-bg.png',
    subtitle: 'Debit Card',
    title: 'Received through Debit Card',
    amount: -838.71,
    percentage: 20,
    color: 'primary',
  }
]

const Transactions = () => {
  return (
    <Card>
      <CardHeader
        title='Payment Channels'
        action={<OptionMenu options={['Last Month', 'Last 6 Months', 'Last Year']} />}
      />
      <CardContent className='flex flex-col gap-6'>
        {data.map((item, index) => (
          <div key={index} className='flex items-center gap-3'>
            <Avatar src={item.imgSrc} alt={item.subtitle} variant='rounded' />
            <div className='flex justify-between items-center gap-x-4 gap-y-1 is-full w-full'>
              <div className='flex flex-col items-start w-1/2'>
                <Typography variant='body2'>{item.subtitle}</Typography>
                <Typography color='text.primary'>{item.title}</Typography>
              </div>
              <div className='flex items-center gap-2 w-1/2 justify-end'>
                {/* <Typography color='text.primary'>{`${item.amount > 0 ? '+' : ''}${item.amount}`}</Typography>
                <Typography color='text.disabled'>PKR</Typography> */}
                {/* add percentage bar here */}
                <LinearProgress
                  variant='determinate'
                  value={item.percentage}
                  color={item.color}
                  className='is-full bs-2'
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default Transactions
