'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import { toast } from 'react-toastify'
import Grid from 'antd/es/card/Grid'
import { CircularProgress } from '@mui/material'
import CustomTextField from '@core/components/mui/TextField'
import { getAlUsersThunk } from '@/redux-store/slices/authSlice'
import {
  assignTaskThunk,
  extractAgentsFromPlatform,
  fetchAssignedTasksThunk,
  fetchPlatformsThunk,
  fetchUnassignedOrdersThunk
} from '@/redux-store/slices/taskAsssignment'

const TaskAssignmentForm = ({ onCloseAssignmentForm }) => {
  const dispatch = useDispatch()

  // States
  const [splitAutomatically, setSplitAutomatically] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const [selectedAgents, setSelectedAgents] = useState([])
  const [taskAssignments, setTaskAssignments] = useState([])
  const [agents, setAgents] = useState([])
  const [brand, setBrand] = useState([])
  const [assignedLoading, setAssignedLoading] = useState(false)

  // const [platforms, setPlatforms] = useState([])
  const [platformsLoading, setPlatformsLoading] = useState(false)
  const { platforms, extractedAgentsFromPlatform, unassignedTotal, assignedTasksMap, agentTaskCounts } = useSelector(
    state => state.taskAsssignment
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const MAX_TASKS = 200

  // Available platforms (mock data)
  const availablePlatforms = platforms.map(platform => ({
    _id: platform._id,
    name: `${platform.agents.map(agent => agent.firstName + ' ' + agent.lastName).join(', ')} (${platform.platforms.join(', ')})`
  }))

  const agentOptions = useMemo(() => extractedAgentsFromPlatform || [], [extractedAgentsFromPlatform])

  // Fetch agents from API
  useEffect(() => {
    if (selectedPlatform?._id) {
      dispatch(extractAgentsFromPlatform({ id: selectedPlatform._id }))
      setAssignedLoading(true)
      dispatch(fetchAssignedTasksThunk({ platform: selectedPlatform._id }))
        .unwrap()
        .finally(() => setAssignedLoading(false))
    }
  }, [dispatch, selectedPlatform])

  const fetchPlatforms = async () => {
    try {
      setPlatformsLoading(true)
      const response = await dispatch(fetchPlatformsThunk({ limit: 10 }))

      // setPlatforms(response.payload.platformAssignment || [])
    } catch (err) {
      setError('Failed to fetch platforms')
    } finally {
      setPlatformsLoading(false)
    }
  }

  const fetchAgents = async () => {
    try {
      setLoading(true)

      // TODO: Replace with actual API call
      // const response = await dispatch(getUsers())
      // setAgents(response.data || [])
      // const response = await dispatch(getAlUsersThunk({ params: { role: 'agent' } }))
      const response = dispatch(extractAgentsFromPlatform({ id: selectedPlatform?._id }))

      setAgents(extractedAgentsFromPlatform || [])

      // Mock data for now
      // setAgents([
      //   {
      //     _id: '68cac74b77b7c1e22585e7d3',
      //     firstName: 'Husnain',
      //     lastName: 'Test',
      //     email: 'muhammadhusnain64970@gmail.com'
      //   },
      //   {
      //     _id: '68cac6d577b7c1e22585e7c2',
      //     firstName: 'Ash',
      //     lastName: 'Markhor',
      //     email: 'ash.markhor@gmail.com'
      //   }
      // ])
    } catch (err) {
      setError('Failed to fetch agents')
    } finally {
      setLoading(false)
    }
  }

  // Orders fetching removed per requirements

  const addTaskAssignment = () => {
    setTaskAssignments([...taskAssignments, { agent: null, tasks: [] }])
  }

  const removeTaskAssignment = index => {
    setTaskAssignments(taskAssignments.filter((_, i) => i !== index))
  }

  const updateTaskAssignment = (index, field, value) => {
    const updated = [...taskAssignments]

    updated[index] = { ...updated[index], [field]: value }
    setTaskAssignments(updated)
  }

  const addTaskToAssignment = (assignmentIndex, taskId) => {
    const updated = [...taskAssignments]

    if (!updated[assignmentIndex].tasks.includes(taskId)) {
      updated[assignmentIndex].tasks.push(taskId)
      setTaskAssignments(updated)
    }
  }

  const removeTaskFromAssignment = (assignmentIndex, taskId) => {
    const updated = [...taskAssignments]

    updated[assignmentIndex].tasks = updated[assignmentIndex].tasks.filter(id => id !== taskId)
    setTaskAssignments(updated)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      // Prevent submission if manual mode and no assignments added
      if (!splitAutomatically && taskAssignments.length < 1) {
        setError('Add at least one task assignment before submitting.')
        setLoading(false)

        return
      }

      const selectedBrandValues = (brand || []).map(b => b.value)

      let requestBody

      if (splitAutomatically) {
        // Auto split mode → send agent IDs; numOfTasks empty
        requestBody = {
          platform: selectedPlatform?._id,
          brand: selectedBrandValues,
          numOfTasks: [],
          numOfAgents: (selectedAgents || []).map(agent => agent?._id).filter(Boolean),
          split: true
        }
      } else {
        // Manual mode → send { tasks: number, agent: id }
        requestBody = {
          platform: selectedPlatform?._id,
          brand: selectedBrandValues,
          numOfTasks: (taskAssignments || [])
            .filter(a => a?.agent?._id)
            .map(assignment => ({
              tasks: Array.isArray(assignment.tasks) ? assignment.tasks.length : Number(assignment.tasks) || 0,
              agent: assignment.agent?._id
            })),
          numOfAgents: [],
          split: false
        }
      }

      const response = await dispatch(assignTaskThunk(requestBody))

      if (response.meta.requestStatus === 'fulfilled') {
        setSuccess(true)

        // Reset form
        setSelectedPlatform(null)
        setBrand([])
        setSelectedAgents([])
        setTaskAssignments([])
        toast.success('Tasks assigned successfully!')
      }
    } catch (err) {
      setError(err.message || 'Failed to assign tasks')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    // Platform and brand are always required
    if (!selectedPlatform || !brand) return false

    if (splitAutomatically) {
      // Auto split requires at least one agent selected
      return (selectedAgents || []).length > 0
    }

    // Manual mode requires at least one assignment
    if (!Array.isArray(taskAssignments) || taskAssignments.length < 1) return false

    // Each assignment must have an agent and a positive tasks count
    const cap = Math.max(0, Number(unassignedTotal) || 0)
    let totalRequested = 0

    const allValid = taskAssignments.every(assignment => {
      const tasksCount = Array.isArray(assignment?.tasks) ? assignment.tasks.length : Number(assignment?.tasks) || 0

      totalRequested += tasksCount
      return Boolean(assignment?.agent?._id) && tasksCount > 0
    })

    if (!allValid) return false
    return totalRequested <= cap
  }

  const brands = [
    { label: 'All', value: 'All' },
    { label: 'Glowrify', value: 'glowrify' },
    { label: 'Sukooon Wellness', value: 'sukoon' }
  ]

  return (
    <Card>
      <CardHeader title='Task Assignment' />
      <CardContent>
        <Box className='space-y-6'>
          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* {success && <Alert severity='success'>Tasks assigned successfully!</Alert>} */}

          <Divider />

          {/* Platform Selection */}
          <Autocomplete
            fullWidth
            options={availablePlatforms}
            getOptionLabel={option => option.name}
            value={selectedPlatform}
            onChange={(event, newValue) => setSelectedPlatform(newValue)}
            renderInput={params => (
              <TextField {...params} label='Select Platform' placeholder='Choose platform for task assignment' />
            )}
          />

          {selectedPlatform?._id ? (
            assignedLoading ? (
              <Box className='flex justify-center py-6'>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <Divider />
                <Grid container spacing={2} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
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

          {/* Brand Selection */}
          <Autocomplete
            multiple
            fullWidth
            options={brands}
            getOptionLabel={option => option.label}
            value={brand}
            onChange={(event, newValue) => {
              const allOption = brands.find(b => b.value === 'All')
              const allSelected = newValue.some(b => b.value === 'All')

              if (allSelected) {
                // If user selects "All", set all except "All" itself
                const allWithoutAll = brands.filter(b => b.value !== 'All')

                setBrand(allWithoutAll)

                if (selectedPlatform?._id) {
                  dispatch(
                    fetchUnassignedOrdersThunk({
                      platform: selectedPlatform._id,
                      brand: allWithoutAll.map(b => b.value)
                    })
                  )
                }
              } else {
                // Normal selection (filter out "All" if accidentally included)
                const filtered = newValue.filter(b => b.value !== 'All')

                setBrand(filtered)

                if (selectedPlatform?._id) {
                  dispatch(
                    fetchUnassignedOrdersThunk({
                      platform: selectedPlatform._id,
                      brand: filtered.map(b => b.value)
                    })
                  )
                }
              }
            }}
            renderInput={params => (
              <TextField
                {...params}
                label='Select Brand(s)'
                placeholder='Choose one or more brands'
                helperText={
                  selectedPlatform?._id ? (
                    <Typography variant='body2' color='textSecondary'>
                      Unassigned Orders: {unassignedTotal}
                    </Typography>
                  ) : null
                }
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.value} label={option.label} variant='outlined' />
              ))
            }
          />

          {/* Split Automatically Checkbox */}
          <div className='flex justify-between'>
            <FormControlLabel
              control={
                <Checkbox checked={splitAutomatically} onChange={e => setSplitAutomatically(e.target.checked)} />
              }
              label='Split Equally Among Selected Agents'
            />
            {/* <Button variant='contained' onClick={onCloseAssignmentForm} startIcon={<i className='bx-close' />}>
              Back
            </Button> */}
          </div>

          {/* Agents Selection */}
          {splitAutomatically && (
            <Autocomplete
              multiple
              fullWidth
              disableCloseOnSelect
              options={extractedAgentsFromPlatform}
              getOptionLabel={option => `${option.firstName} ${option.lastName} (${option.email})`}
              value={selectedAgents}
              onChange={(event, newValue) => setSelectedAgents(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={index}
                    label={`${option.firstName} ${option.lastName}`}
                    variant='outlined'
                  />
                ))
              }
              renderInput={params => (
                <TextField
                  {...params}
                  label='Select Agents'
                  placeholder='Choose agents for task assignment'
                  helperText={`${selectedAgents.length} agent(s) selected`}
                />
              )}
              loading={loading}
              disabled={loading}
            />
          )}

          {/* Manual Task Assignment Section */}
          {!splitAutomatically && (
            <Box className='space-y-4'>
              <Box className='flex justify-between items-center'>
                <Typography variant='h6'>Task Assignments</Typography>
                <Button variant='outlined' onClick={addTaskAssignment} startIcon={<i className='bx-plus' />}>
                  Add Assignment
                </Button>
              </Box>

              <Box className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {taskAssignments.map((assignment, index) => {
                  const usedAgentIds = taskAssignments
                    .slice(0, index)
                    .map(a => a?.agent?._id)
                    .filter(Boolean)

                  const agentOptions = (extractedAgentsFromPlatform || []).filter(
                    a => !usedAgentIds.includes(a._id) || (assignment?.agent && assignment.agent._id === a._id)
                  )

                  return (
                    <Card key={index} variant='outlined' className=' border-0'>
                      <CardContent className='border rounded-lg'>
                        <Box className='space-y-4'>
                          <Box className='flex justify-between items-center'>
                            <Typography variant='subtitle1'>Assignment {index + 1}</Typography>
                            <IconButton onClick={() => removeTaskAssignment(index)} color='error' size='small'>
                              <i className='bx-trash' />
                            </IconButton>
                          </Box>

                          {/* Agent Selection for this assignment */}
                          <Autocomplete
                            fullWidth
                            options={agentOptions}
                            getOptionLabel={option => `${option.firstName} ${option.lastName} (${option.email})`}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            filterSelectedOptions
                            value={assignment.agent}
                            onChange={(event, newValue) => updateTaskAssignment(index, 'agent', newValue)}
                            renderInput={params => (
                              <TextField
                                {...params}
                                label='Select Agent'
                                placeholder='Choose agent for this assignment'
                              />
                            )}
                          />

                          {/* Number of Tasks Selection */}
                          <TextField
                            fullWidth
                            type='number'
                            label='Number of Tasks'
                            value={
                              Array.isArray(assignment.tasks) ? assignment.tasks.length : Number(assignment.tasks) || 0
                            }
                            onChange={e => {
                              const cap = Math.max(0, Number(unassignedTotal) || 0)
                              const requested = Math.max(0, Math.min(Number(e.target.value) || 0, cap))

                              updateTaskAssignment(index, 'tasks', requested)
                            }}
                            inputProps={{ min: 0, max: Math.max(0, Number(unassignedTotal) || 0) }}
                            helperText={`Max: ${Math.max(0, Number(unassignedTotal) || 0)}`}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  )
                })}
              </Box>

              {taskAssignments.length === 0 && (
                <Alert severity='info'>
                  No task assignments added. Click &quot;Add Assignment&quot; to create manual task assignments.
                </Alert>
              )}
            </Box>
          )}

          {/* Submit Button */}
          <Box className='flex justify-end'>
            <Button variant='contained' onClick={handleSubmit} disabled={!isFormValid() || loading} size='large'>
              {loading ? 'Assigning...' : 'Assign Tasks'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default TaskAssignmentForm
