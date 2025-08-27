'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import MuiTimeline from '@mui/lab/Timeline'

// Styled Timeline component
const Timeline = styled(MuiTimeline)({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    },
    '& .MuiTimelineContent-root:last-child': {
      paddingBottom: 0
    },
    '&:nth-last-child(2) .MuiTimelineConnector-root': {
      backgroundColor: 'transparent',
      borderInlineStart: '1px dashed var(--mui-palette-divider)'
    },
    '& .MuiTimelineConnector-root': {
      backgroundColor: 'var(--mui-palette-primary-main)'
    }
  }
})

// Mock Data (replace with API response later)
const mockSteps = [
  {
    id: 1,
    title: 'Order was placed',
    subtitle: 'Your order has been placed successfully',
    date: 'Tuesday 11:29 AM',
    color: 'primary'
  },
  {
    id: 2,
    title: 'Pick-up',
    subtitle: 'Pick-up scheduled with courier',
    date: 'Wednesday 11:29 AM',
    color: 'primary'
  },
  {
    id: 3,
    title: 'Dispatched',
    subtitle: 'Item has been picked up by courier.',
    date: 'Thursday 8:15 AM',
    color: 'primary'
  },
  {
    id: 4,
    title: 'Package arrived',
    subtitle: 'Package arrived at an Amazon facility, NY',
    date: 'Saturday 15:20 AM',
    color: 'primary'
  },
  {
    id: 5,
    title: 'Dispatched for delivery',
    subtitle: 'Package has left an Amazon facility, NY',
    date: 'Today 14:12 PM',
    color: 'primary'
  },
  {
    id: 6,
    title: 'Delivery',
    subtitle: 'Package will be delivered by tomorrow',
    date: '',
    color: 'secondary'
  }
]

const ShippingActivity = ({ order }) => {
  const [shippingSteps, setShippingSteps] = useState(mockSteps)

  // Example: Later you can fetch from API
  /*
  useEffect(() => {
    fetch(`/api/orders/${order}/shipping-activity`)
      .then(res => res.json())
      .then(data => setShippingSteps(data))
  }, [order])
  */

  return (
    <Card>
      <CardHeader title='Shipping Activity' />
      <CardContent>
        <Timeline>
          {shippingSteps.map((step, index) => (
            <TimelineItem key={step.id}>
              <TimelineSeparator>
                <TimelineDot color={step.color} />
                {index < shippingSteps.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                  <Typography variant='h6'>
                    {step.title}
                    {step.id === 1 && ` (Order ID: #${order})`}
                  </Typography>
                  {step.date && <Typography variant='caption'>{step.date}</Typography>}
                </div>
                <Typography className='mbe-2'>{step.subtitle}</Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  )
}

export default ShippingActivity
