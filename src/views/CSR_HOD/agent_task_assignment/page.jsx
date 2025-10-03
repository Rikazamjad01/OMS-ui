'use client'

import { useState } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'

// Component Imports
import PlatformCreationForm from './components/PlatformCreationForm'
import TaskAssignmentForm from './components/TaskAssignmentForm'

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

const AgentTaskAssignment = () => {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label='agent task assignment tabs'>
          <Tab label='Platform Creation' {...a11yProps(0)} />
          <Tab label='Task Assignment' {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <PlatformCreationForm />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TaskAssignmentForm />
      </TabPanel>
    </Box>
  )
}

export default AgentTaskAssignment
