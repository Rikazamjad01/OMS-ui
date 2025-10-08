// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'

// Vars
const connectedAccountsArr = [
  {
    checked: true,
    title: 'Google',
    logo: '/images/logos/google.png',
    subtitle: 'Calendar and Contacts'
  },
  {
    checked: false,
    title: 'Slack',
    logo: '/images/logos/slack.png',
    subtitle: 'Communications'
  },
  {
    checked: true,
    title: 'Github',
    logo: '/images/logos/github.png',
    subtitle: 'Manage your Git repositories'
  },
  {
    checked: true,
    title: 'Mailchimp',
    subtitle: 'Email marketing service',
    logo: '/images/logos/mailchimp.png'
  },
  {
    title: 'Asana',
    checked: false,
    subtitle: 'Task Communication',
    logo: '/images/logos/asana.png'
  }
]

const socialAccountsArr = [
  {
    title: 'Facebook',
    isConnected: false,
    logo: '/images/logos/facebook.png'
  },
  {
    title: 'Twitter',
    isConnected: true,
    username: '@ThemeSelection',
    logo: '/images/logos/twitter.png',
    href: 'https://twitter.com/Theme_Selection'
  },
  {
    title: 'Linkedin',
    isConnected: true,
    username: '@ThemeSelection',
    logo: '/images/logos/linkedin.png',
    href: 'https://in.linkedin.com/company/themeselection'
  },
  {
    title: 'Dribbble',
    isConnected: false,
    logo: '/images/logos/dribbble.png'
  },
  {
    title: 'Behance',
    isConnected: false,
    logo: '/images/logos/behance.png'
  }
]

const courierPlatforms = [
  { title: 'Leopards', code: 'leopard', img: '/images/couriers/leopards.png',},
  { title: 'Daewoo', code: 'daewoo', img: '/images/couriers/daewoo.png',},
  { title: 'Post Ex', code: 'postEx', img: '/images/couriers/postEx.jpg',},
  { title: 'M&P', code: 'mp', img: '/images/couriers/m&p.jpg',},
  { title: 'TCS', code: 'tcs', img: '/images/couriers/tcs.jpg',},
]

const SettingsPage = () => {
  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <Grid container>
          <Grid size={{ xs: 12, md: 6 }}>
            <CardHeader
              title='Connected Accounts'
              subheader='Display content from your connected accounts on your site'
            />
            <CardContent className='flex flex-col gap-4'>
              {connectedAccountsArr.map((item, index) => (
                <div key={index} className='flex items-center justify-between gap-4'>
                  <div className='flex flex-grow items-center gap-4'>
                    <img height={32} width={32} src={item.logo} alt={item.title} />
                    <div className='flex-grow'>
                      <Typography variant='h6'>{item.title}</Typography>
                      <Typography variant='body2'>{item.subtitle}</Typography>
                    </div>
                  </div>
                  <Switch defaultChecked={item.checked} />
                </div>
              ))}
            </CardContent>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CardHeader title='Social Accounts' subheader='Display content from social accounts on your site' />
            <CardContent className='flex flex-col gap-4'>
              {socialAccountsArr.map((item, index) => (
                <div key={index} className='flex items-center justify-between gap-4'>
                  <div className='flex flex-grow items-center gap-4'>
                    <img height={32} width={32} src={item.logo} alt={item.title} />
                    <div className='flex-grow'>
                      <Typography variant='h6'>{item.title}</Typography>
                      {item.isConnected ? (
                        <Typography
                          variant='body2'
                          color='primary.main'
                          component={Link}
                          href={item.href || '/'}
                          target='_blank'
                        >
                          {item.username}
                        </Typography>
                      ) : (
                        <Typography variant='body2'>Not Connected</Typography>
                      )}
                    </div>
                  </div>
                  <CustomIconButton variant='tonal' color={item.isConnected ? 'error' : 'secondary'}>
                    <i className={item.isConnected ? 'bx-trash' : 'bx-link'} />
                  </CustomIconButton>
                </div>
              ))}
            </CardContent>
          </Grid>
        </Grid>
      </Card>
      <Card>
          <Grid size={{md: 6 }}>
            <CardHeader
              title='Courier Platforms'
              subheader='courier platforms you want to use for your orders'
            />
            <CardContent className='flex flex-col gap-4'>
              {courierPlatforms.map((item, index) => (
                <div key={index} className='flex items-center justify-between gap-4'>
                  <div className='flex flex-grow items-center gap-4'>
                    <img height={32} width={32} src={item.img} alt={item.title} className='object-contain' />
                    <div className='flex-grow'>
                      <Typography variant='h6'>{item.title}</Typography>
                      <Typography variant='body2'>{item.subtitle}</Typography>
                    </div>
                  </div>
                  <Switch defaultChecked={item.checked} />
                </div>
              ))}
            </CardContent>
          </Grid>
      </Card>
    </div>
  )
}

export default SettingsPage
