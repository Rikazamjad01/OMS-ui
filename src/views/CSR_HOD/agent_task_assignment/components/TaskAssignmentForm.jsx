'use client'

import { useState, useEffect } from 'react'
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
import CustomTextField from '@core/components/mui/TextField'
import { getAlUsersThunk } from '@/redux-store/slices/authSlice'
import {
  assignTaskThunk,
  extractAgentsFromPlatform,
  fetchPlatformsThunk,
  fetchUnassignedOrdersThunk
} from '@/redux-store/slices/taskAsssignment'
import { toast } from 'react-toastify'

const TaskAssignmentForm = () => {
  const dispatch = useDispatch()

  // States
  const [splitAutomatically, setSplitAutomatically] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const [brand, setBrand] = useState('')
  const [selectedAgents, setSelectedAgents] = useState([])
  const [taskAssignments, setTaskAssignments] = useState([])
  const [agents, setAgents] = useState([])
  // const [platforms, setPlatforms] = useState([])
  const [platformsLoading, setPlatformsLoading] = useState(false)
  const { platforms, extractedAgentsFromPlatform, unassignedTotal } = useSelector(state => state.taskAsssignment)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const MAX_TASKS = 200
  // Available platforms (mock data)
  const availablePlatforms = platforms.map(platform => ({
    _id: platform._id,
    name: `${platform.agents.map(agent => agent.firstName + ' ' + agent.lastName).join(', ')} (${platform.platforms.join(', ')})`
  }))

  // Fetch agents from API
  useEffect(() => {
    fetchAgents()
    fetchPlatforms()
    if (selectedPlatform?._id) {
      dispatch(fetchUnassignedOrdersThunk({ platform: selectedPlatform._id }))
    }
  }, [selectedPlatform])

  const fetchPlatforms = async () => {
    try {
      setPlatformsLoading(true)
      const response = await dispatch(fetchPlatformsThunk({ limit: 10 }))
      console.log(response)
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
      console.log(response)
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

      let requestBody

      if (splitAutomatically) {
        // Auto split mode → send agent IDs; numOfTasks empty
        requestBody = {
          platform: selectedPlatform?._id,
          brand: brand,
          numOfTasks: [],
          numOfAgents: (selectedAgents || []).map(agent => agent?._id).filter(Boolean),
          split: true
        }
      } else {
        // Manual mode → send { tasks: number, agent: id }
        requestBody = {
          platform: selectedPlatform?._id,
          brand: brand,
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

      console.log('Task Assignment Request Body:', requestBody)

      // TODO: Replace with actual API call
      // await dispatch(assignTasks(requestBody))
      const response = await dispatch(assignTaskThunk(requestBody))
      console.log(response)
      if (response.meta.requestStatus === 'fulfilled') {
        setSuccess(true)

        // Reset form
        setSelectedPlatform(null)
        setBrand('')
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
  console.log(isFormValid())
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

          {/* Split Automatically Checkbox */}
          <FormControlLabel
            control={<Checkbox checked={splitAutomatically} onChange={e => setSplitAutomatically(e.target.checked)} />}
            label='Split automatically'
          />

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

          {/* Brand Selection */}
          <TextField fullWidth label='Brand' value={brand} onChange={e => setBrand(e.target.value)} select>
            {/* Unassigned Orders Info */}
            {selectedPlatform?._id ? (
              <Typography variant='body2' color='textSecondary'>
                Unassigned Orders: {unassignedTotal}
              </Typography>
            ) : null}
            <MenuItem value='' disabled>
              Select a brand
            </MenuItem>
            <MenuItem value='Glowrify'>Glowrify</MenuItem>
            <MenuItem value='sukoon wellness'>sukoon wellness</MenuItem>
          </TextField>

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

              {taskAssignments.map((assignment, index) => {
                const usedAgentIds = taskAssignments
                  .slice(0, index)
                  .map(a => a?.agent?._id)
                  .filter(Boolean)

                const agentOptions = (extractedAgentsFromPlatform || []).filter(
                  a => !usedAgentIds.includes(a._id) || (assignment?.agent && assignment.agent._id === a._id)
                )

                return (
                  <Card key={index} variant='outlined'>
                    <CardContent>
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

              {taskAssignments.length === 0 && (
                <Alert severity='info'>
                  No task assignments added. Click "Add Assignment" to create manual task assignments.
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
