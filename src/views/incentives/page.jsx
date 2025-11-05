'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import { Paper } from '@mui/material'
import ChannelForm from './ChannelForm'

function TabPanel({ children, value, index }) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`channel-tabpanel-${index}`}
      aria-labelledby={`channel-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const channels = [
  'Shopify',
  'WhatsApp Team Widget',
  'WhatsApp Team Sponsored',
  'WhatsApp Organic',
  'Facebook Page',
  'Facebook Ads',
  'Instagram Page',
  'Instagram Ads'
]

const IncentivesPage = () => {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  return (
    <Paper elevation={0} sx={{ width: '100%', border: '1px solid #ddd', p: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label='Channel tabs'
          variant='scrollable'
          scrollButtons='auto'
        >
          {channels.map((channel, index) => (
            <Tab key={channel} label={channel} id={`channel-tab-${index}`} />
          ))}
        </Tabs>
      </Box>

      {channels.map((channel, index) => (
        <TabPanel key={channel} value={tabValue} index={index}>
          <ChannelForm channel={channel} />
        </TabPanel>
      ))}
    </Paper>
  )
}

export default IncentivesPage
