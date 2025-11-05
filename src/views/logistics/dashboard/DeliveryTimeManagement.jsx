'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import styles from './styles.module.css'

const data = [
  {
    icon: 'bx-car',
    heading: '1 day',
    time: '2hr 10min',
    progressColor: 'success',
    progressColorVariant: 'main',
    progressData: '20.7%',
    widthClass: 'is-[20.7%]'
  },
  {
    icon: 'bx-down-arrow-circle',
    heading: '2 days',
    time: '3hr 15min',
    progressColor: 'primary',
    progressColorVariant: 'main',
    progressData: '20.3%',
    widthClass: 'is-[20.3%]'
  },
  {
    icon: 'bx-up-arrow-circle',
    heading: '5 days',
    time: '1hr 24min',
    progressColor: 'orange',
    progressColorVariant: 'main',
    progressData: '20.4%',
    widthClass: 'is-[20.4%]'
  },
  {
    icon: 'bx-time-five',
    heading: '10 days',
    time: '5hr 19min',
    progressColor: 'info',
    progressColorVariant: 'dark',
    progressData: '20.6%',
    widthClass: 'is-[20.6%]'
  },
  {
    icon: 'bx-time-five',
    heading: '10+',
    time: '5hr 19min',
    progressColor: 'SnackbarContent',
    progressColorVariant: 'bg',
    progressData: '18%',
    widthClass: 'is-[18%]'
  }
]

const DeliveryTimeManagement = () => {
  return (
    <Card>
      <CardHeader title='Delivery Time Management' action={<OptionMenu options={['Leopard', 'PostEx', 'M&P Express', 'Monthly']} />} />
      <CardContent>
        <div className='flex flex-col gap-2'>
          <Typography variant='h6'>Delivered ratio in term of days</Typography>
          <div className='flex is-full'>
            {data.map((item, index) => (
              <div
                key={index}
                className={classnames(item.widthClass, styles.linearRound, 'flex flex-col gap-[38px] relative')}
              >
                <Typography className={classnames(styles.header, 'relative max-sm:hidden')}>{item.heading}</Typography>
                <LinearProgress
                  variant='determinate'
                  value={-1}
                  className={classnames('bs-[46px]')}
                  // eslint-disable-next-line lines-around-comment
                  // @ts-ignore
                  sx={{
                    backgroundColor: `var(--mui-palette-${item.progressColor}-${item.progressColorVariant})`,
                    borderRadius: 0
                  }}
                />
                <Typography
                  variant='body2'
                  className='absolute bottom-3 start-3.5 font-medium'
                  sx={{
                    color: theme =>
                      index === 0
                        ? 'var(--mui-palette-text-primary)'
                        : item.progressColor === 'info'
                          ? 'var(--mui-palette-common-white)'
                          : // eslint-disable-next-line lines-around-comment
                            // @ts-ignore
                            theme.palette.getContrastText(theme.palette[item.progressColor][item.progressColorVariant])
                  }}
                >
                  {item.progressData}
                </Typography>
              </div>
            ))}
          </div>
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className='border-bs-0'>
                    <td className='flex items-center gap-2 pis-0'>
                      <i className={classnames(item.icon, 'text-textPrimary text-[1.5rem]')} />
                      <Typography color='text.primary'>{item.heading}</Typography>
                    </td>
                    <td className='text-end'>
                      <Typography variant='h6'>{item.time}</Typography>
                    </td>
                    <td className='text-end pie-0'>
                      <Typography className='font-medium'>{item.progressData}</Typography>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DeliveryTimeManagement
