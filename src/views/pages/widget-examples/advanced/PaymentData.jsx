'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid2'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import CustomInputHorizontal from '@core/components/custom-inputs/Horizontal'
import CustomTextField from '@core/components/mui/TextField'

const data = [
  {
    value: 'paypal',
    title: 'Paypal',
    isSelected: true
  },
  {
    value: 'credit-card',
    title: 'Credit Card'
  }
]

const PaymentData = () => {
  const initialSelected = data.filter(item => item.isSelected)[data.filter(item => item.isSelected).length - 1].value

  // States
  const [selected, setSelected] = useState(initialSelected)

  const handleChange = prop => {
    if (typeof prop === 'string') {
      setSelected(prop)
    } else {
      setSelected(prop.target.value)
    }
  }

  return (
    <Card>
      <CardHeader title='Payment Data' action={<OptionMenu options={['Re-send OTP', 'Call Support', 'Delete']} />} />
      <CardContent className='flex flex-col gap-5 lg:pbs-3'>
        <div className='flex flex-col gap-0.5'>
          <Typography variant='caption' color='text.secondary'>
            Price
          </Typography>
          <div className='flex items-center gap-2'>
            <Typography variant='h5' color='primary.main'>
              $455.60
            </Typography>
            <Chip label='35% Off' color='primary' variant='tonal' className='uppercase' size='small' />
          </div>
        </div>
        <Grid container spacing={5}>
          <Grid size={{ xs: 12 }}>
            <Typography variant='body2' className='mbe-2'>
              Choose payment method:
            </Typography>
            <Grid container spacing={5}>
              {data.map(item => (
                <CustomInputHorizontal
                  type='radio'
                  key={item.value}
                  data={item}
                  selected={selected}
                  name='card-payment-method-radio'
                  handleChange={handleChange}
                  gridProps={{ size: { xs: 12, sm: 6 }, sx: { '& > div': { p: 0 } } }}
                />
              ))}
            </Grid>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomTextField fullWidth placeholder='Card Number' />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CustomTextField fullWidth placeholder='Expiry Date' />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CustomTextField fullWidth placeholder='CVV Code' />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomTextField fullWidth placeholder='Name' />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel control={<Checkbox defaultChecked />} label='Save Card?' />
          </Grid>
        </Grid>
        <Button fullWidth variant='contained'>
          Add Card
        </Button>
      </CardContent>
    </Card>
  )
}

export default PaymentData
