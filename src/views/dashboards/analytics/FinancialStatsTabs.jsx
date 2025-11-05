'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Tab from '@mui/material/Tab'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme, styled } from '@mui/material/styles'

// Components Imports
import { Button } from '@mui/material'
import CustomTabList from '@core/components/mui/TabList'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const tabData = [
  {
    type: 'income',
    series: [{ data: [24, 21, 30, 22, 42, 26, 35, 29] }],
    title: 'Income',
    imgSrc: '/images/cards/wallet-primary-bg.png',
    stats: '$459.1k',
    trendPercent: 65,
    trend: 'up',
    trendAmount: '6.5',
    trendCompare: '$39k'
  },
  {
    type: 'expense',
    title: 'Expenses',
    imgSrc: '/images/cards/paypal-error-bg.png',
    stats: '$316.5k',
    trendPercent: 27.8,
    trend: 'up',
    trendAmount: '7.2',
    trendCompare: '$16k'
  },
  {
    type: 'profit',
    series: [{ data: [24, 21, 30, 22, 42, 26, 35, 35] }],
    title: 'Profit',
    imgSrc: '/images/cards/chart-success-bg.png',
    stats: '$147.9k',
    trendPercent: 35.1,
    trend: 'up',
    trendAmount: '4.5',
    trendCompare: '$28k'
  }
]

const CircularProgressBg = styled(CircularProgress)({
  color: 'var(--mui-palette-customColors-trackBg)'
})

const CircularProgressValue = styled(CircularProgress)({
  left: 0,
  position: 'absolute',
  color: 'var(--mui-palette-primary-main)',
  '& .MuiCircularProgress-circle': { strokeLinecap: 'round' }
})

const FinancialStatsTabs = () => {
  // States
  const [value, setValue] = useState('income')
  const [expenseValue, setExpenseValue] = useState('316.5k')

  // Hooks
  const theme = useTheme()

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const options = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    dataLabels: { enabled: false },
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    grid: {
      borderColor: 'var(--mui-palette-divider)',
      strokeDashArray: 4.5,
      padding: {
        left: 0,
        top: -20,
        right: 11,
        bottom: 7
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityTo: 0.25,
        opacityFrom: 0.5,
        stops: [0, 95, 100],
        shadeIntensity: 0.6,
        colorStops: [
          [
            {
              offset: 0,
              opacity: 0.4,
              color: theme.palette.primary.main
            },
            {
              offset: 100,
              opacity: 0.2,
              color: 'var(--mui-palette-background-paper)'
            }
          ]
        ]
      }
    },
    theme: {
      monochrome: {
        enabled: true,
        shadeTo: 'light',
        shadeIntensity: 1,
        color: theme.palette.primary.main
      }
    },
    xaxis: {
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      labels: {
        style: {
          fontSize: '13px',
          colors: 'var(--mui-palette-text-disabled)',
          fontFamily: 'Public Sans'
        }
      }
    },
    yaxis: {
      min: 10,
      max: 50,
      show: false,
      tickAmount: 4
    },
    markers: {
      size: 8,
      strokeWidth: 6,
      strokeOpacity: 1,
      hover: { size: 8 },
      colors: ['transparent'],
      strokeColors: 'transparent',
      discrete: tabData.map((tab, index) => ({
        size: 8,
        seriesIndex: index,
        fillColor: 'var(--mui-palette-background-paper)',
        strokeColor: `var(--mui-palette-${index === 0 ? 'primary' : index === 1 ? 'secondary' : 'error'}-main)`,
        dataPointIndex: 7
      }))
    }
  }

  return (
    <Card>
      <CardContent>
        <TabContext value={value}>
          <CustomTabList pill='true' onChange={handleChange} aria-label='Financial Stats Tabs' className='mbe-6'>
            {tabData.map((tab, index) => (
              <Tab key={index} label={tab.title} value={tab.type} />
            ))}
          </CustomTabList>
          {tabData.map((tab, index) => (
            <TabPanel key={index} value={tab.type} className='p-0 mt-5'>
              <div className='flex gap-3 mbe-6'>
                <img src={tab.imgSrc} alt={tab.title} className='is-[48px] bs-[48px]' />
                <div className='flex flex-col gap-y-0.5'>
                  <Typography>{tab.title}</Typography>
                  <div className='flex gap-x-2 items-center'>
                    <Typography variant='h6'>{tab.type === 'expense' ? `$${expenseValue}` : tab.stats}</Typography>
                    <Typography
                      variant='body2'
                      color={tab.trend === 'up' ? 'success.main' : 'error.main'}
                      className='flex items-center'
                    >
                      <i className={tab.trend === 'up' ? 'bx-chevron-up' : 'bx-chevron-down'} />
                      <span>{tab.trendPercent}%</span>
                    </Typography>
                  </div>
                </div>
              </div>
              {tab.type === 'expense' ? (
                <>
                  <TextField
                    fullWidth
                    label='Expenses'
                    value={expenseValue}
                    onChange={e => setExpenseValue(e.target.value)}
                    className='mbe-5'
                  />
                  <Button fullWidth variant='contained' color='primary' className='mb-2'>
                    Update Expense
                  </Button>
                </>
              ) : (
                <AppReactApexCharts type='area' height={228} width='100%' options={options} series={tab.series} />
              )}
              <div className='flex items-center justify-center gap-4'>
                <div className='relative mbs-3'>
                  <CircularProgressBg variant='determinate' value={100} size={48} />
                  <CircularProgressValue
                    variant='determinate'
                    size={48}
                    value={tab.trendPercent}
                    thickness={5}
                    disableShrink
                  />
                  <Typography className='text-xs absolute block-start-4 inline-start-2.5'>
                    ${tab.trendAmount}
                  </Typography>
                </div>
                <div>
                  <Typography color='text.primary'>
                    <span className='capitalize'>{tab.type}</span>
                    <span> This Month</span>
                  </Typography>
                  <Typography variant='body2'>{tab.trendCompare} less than last week</Typography>
                </div>
              </div>
            </TabPanel>
          ))}
        </TabContext>
      </CardContent>
    </Card>
  )
}

export default FinancialStatsTabs
