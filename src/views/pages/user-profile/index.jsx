'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import UserProfileHeader from './UserProfileHeader'
import CustomTabList from '@core/components/mui/TabList'

const UserProfile = ({ tabContentList, data }) => {
  // States
  const [activeTab, setActiveTab] = useState('profile')

  const handleChange = (event, value) => {
    setActiveTab(value)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <UserProfileHeader data={data} />
      </Grid>
      {activeTab === undefined ? null : (
        <Grid size={{ xs: 12 }} className='flex flex-col gap-6'>
          <TabContext value={activeTab}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab label='Profile' icon={<i className='bx-user' />} iconPosition='start' value='profile' />
              <Tab label='Daily Report' icon={<i className='bx-receipt' />} iconPosition='start' value='daily-report' />
              <Tab label='Incentives' icon={<i className='bx-money' />} iconPosition='start' value='projects' />
              <Tab label='Commissions' icon={<i className='bx-dollar' />} iconPosition='start' value='connections' />
            </CustomTabList>

            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </TabContext>
        </Grid>
      )}
    </Grid>
  )
}

export default UserProfile
