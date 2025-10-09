'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

// App Imports
import {
  fetchPlatformsThunk,
  fetchAssignedTasksThunk,
  extractAgentsFromPlatform,
  markAbsentAndReassignThunk
} from '@/redux-store/slices/taskAsssignment'
import { toast } from 'react-toastify'

const AgentTaskOverview = ({ onOpenAssignmentForm }) => {
  const dispatch = useDispatch()

  const { platforms, extractedAgentsFromPlatform, agentTaskCounts, assignedTasksMap, loading } = useSelector(
    state => state.taskAsssignment
  )

  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const [absentAgent, setAbsentAgent] = useState(null)
  const [reassignToAgents, setReassignToAgents] = useState([])
  const [assignedLoading, setAssignedLoading] = useState(false)

  const platformOptions = useMemo(
    () =>
      (platforms || []).map(p => ({
        _id: p._id,
        name: `${p.agents.map(a => `${a.firstName} ${a.lastName}`).join(', ')} (${(p.platforms || []).join(', ')})`
      })),
    [platforms]
  )

  const agentOptions = useMemo(() => extractedAgentsFromPlatform || [], [extractedAgentsFromPlatform])

  useEffect(() => {
    dispatch(fetchPlatformsThunk({ limit: 20 }))
  }, [dispatch])

  useEffect(() => {
    if (selectedPlatform?._id) {
      dispatch(extractAgentsFromPlatform({ id: selectedPlatform._id }))
      setAssignedLoading(true)
      dispatch(fetchAssignedTasksThunk({ platform: selectedPlatform._id }))
        .unwrap()
        .finally(() => setAssignedLoading(false))
    }
  }, [dispatch, selectedPlatform])

  // Optional: keep function if needed elsewhere
  const handleMarkAbsent = async () => {}

  const handleReassign = async () => {
    if (!selectedPlatform?._id || !absentAgent?._id || (reassignToAgents || []).length === 0) return
    if (reassignToAgents.some(a => a?._id === absentAgent._id)) {
      toast.error('Cannot reassign to the same agent')
      return
    }
    await dispatch(
      markAbsentAndReassignThunk({
        platform: selectedPlatform._id,
        absentAgentId: absentAgent._id,
        reassignToAgents: reassignToAgents.map(a => a._id)
      })
    ).unwrap()
    dispatch(fetchAssignedTasksThunk({ platform: selectedPlatform._id }))
      .unwrap()
      .finally(() => setAssignedLoading(false))
    toast.success('Tasks reassigned')
    // dispatch(fetchAgentTaskCountsThunk({ platformId: selectedPlatform._id }))
  }

  return (
    <Card>
      <CardHeader title='Agent Task Overview' />
      <CardContent>
        <Box className='space-y-6'>
          <Autocomplete
            fullWidth
            options={platformOptions}
            getOptionLabel={option => option.name}
            value={selectedPlatform}
            onChange={(_e, v) => {
              setSelectedPlatform(v)
              setAbsentAgent(null)
              setReassignToAgents([])
            }}
            renderInput={params => <TextField {...params} label='Select Platform' placeholder='Choose platform' />}
          />

          {selectedPlatform?._id ? (
            assignedLoading ? (
              <Box className='flex justify-center py-6'>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <Divider />
                <Grid container spacing={2}>
                  {agentOptions.map(agent => {
                    const count = assignedTasksMap?.[agent._id] ?? agentTaskCounts?.[agent._id] ?? 0
                    return (
                      <Grid item xs={12} md={6} lg={4} key={agent._id}>
                        <Card variant='outlined'>
                          <CardContent>
                            <Box className='flex items-center justify-between'>
                              <Box>
                                <Typography variant='subtitle1'>
                                  {agent.firstName} {agent.lastName}
                                </Typography>
                                <Typography variant='body2' color='textSecondary'>
                                  {agent.email}
                                </Typography>
                              </Box>
                              <Chip label={`${count} task(s)`} color='primary' variant='outlined' />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  })}
                  {agentOptions.length === 0 && (
                    <Grid item xs={12}>
                      <Typography variant='body2' color='textSecondary'>
                        Select a platform to view agents.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </>
            )
          ) : null}

          <Divider />

          <Typography variant='h6'>Mark Absent & Reassign</Typography>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} md={4}>
              <Autocomplete
                fullWidth
                options={agentOptions}
                getOptionLabel={o => `${o.firstName} ${o.lastName} (${o.email})`}
                value={absentAgent}
                onChange={(_e, v) => setAbsentAgent(v)}
                renderInput={params => <TextField {...params} label='Absent Agent' placeholder='Select agent' />}
                disabled={!selectedPlatform || loading}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                multiple
                fullWidth
                disableCloseOnSelect
                options={agentOptions.filter(a => a._id !== absentAgent?._id)}
                getOptionLabel={o => `${o.firstName} ${o.lastName} (${o.email})`}
                value={reassignToAgents}
                onChange={(_e, v) => setReassignToAgents(v)}
                renderInput={params => <TextField {...params} label='Reassign To' placeholder='Select agent(s)' />}
                disabled={!selectedPlatform || !absentAgent || loading}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option._id}
                      label={`${option.firstName} ${option.lastName}`}
                    />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box className='flex gap-2'>
                {/* Mark Absent handled via mark-absent API on reassign */}
                <Button
                  variant='contained'
                  onClick={handleReassign}
                  disabled={!selectedPlatform || !absentAgent || (reassignToAgents || []).length === 0 || loading}
                >
                  Reassign Tasks
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}

export default AgentTaskOverview
