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
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { toast } from 'react-toastify'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { getAlUsersThunk } from '@/redux-store/slices/authSlice'
import { fetchPlatformsThunk, addPlatformsThunk } from '@/redux-store/slices/taskAsssignment'

const PlatformCreationForm = () => {
  const dispatch = useDispatch()

  // States
  const [selectedAgents, setSelectedAgents] = useState([])
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [agents, setAgents] = useState([])

  // const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // const [success, setSuccess] = useState(false)
  // const [platformAssignments, setPlatformAssignments] = useState([])
  const [platformsLoading, setPlatformsLoading] = useState(false)
  const { platforms } = useSelector(state => state.taskAsssignment)

  // Available platforms
  const availablePlatforms = [
    { value: 'shopify', label: 'Shopify' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'manual', label: 'Manual' },
    { value: 'social_media', label: 'Social Media' }
  ]

  // Fetch agents from API
  useEffect(() => {
    fetchAgents()
    fetchPlatforms()
  }, [])

  const fetchAgents = async () => {
    try {
      setLoading(true)

      // TODO: Replace with actual API call
      // const response = await dispatch(getUsers())
      // setAgents(response.data || [])

      // Mock data for now
      const response = await dispatch(getAlUsersThunk({ params: { role: 'agent' } }))

      setAgents(response.payload.users || [])

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

  const fetchPlatforms = async () => {
    try {
      setPlatformsLoading(true)

      // TODO: Replace with actual API call to get platforms
      // const res = await dispatch(getPlatformsThunk({ page: 1, limit: 10 }))
      // const list = res.payload?.data?.platformAssignment || []
      // setPlatformAssignments(list)
      const response = await dispatch(fetchPlatformsThunk({ limit: 10 }))

      // setPlatformAssignments(response.payload.platformAssignment || [])
      // Mocked from provided response shape
      // const mock = {
      //   success: true,
      //   message: 'Platforms retrieved successfully',
      //   data: {
      //     platformAssignment: [
      //       {
      //         _id: '68de3281d61dd3e1dc30baf0',
      //         agents: [
      //           {
      //             _id: '68cac74b77b7c1e22585e7d3',
      //             firstName: 'Husnain',
      //             lastName: 'Test',
      //             email: 'muhammadhusnain64970@gmail.com'
      //           },
      //           {
      //             _id: '68cac6d577b7c1e22585e7c2',
      //             firstName: 'Ash',
      //             lastName: 'Markhor',
      //             email: 'ash.markhor@gmail.com'
      //           }
      //         ],
      //         platforms: ['shopify'],
      //         createdAt: '2025-10-02T08:06:25.696Z',
      //         updatedAt: '2025-10-02T08:06:25.696Z'
      //       }
      //     ],
      //     pagination: { total: 1, page: '1', limit: '10', totalPages: 1, hasNext: false, hasPrevious: false }
      //   }
      // }

      // setPlatformAssignments(mock.data.platformAssignment || [])
    } catch (err) {
      // Non-blocking: keep silent or show toast if needed
      console.error('Failed to fetch platforms', err)
    } finally {
      setPlatformsLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      const selectedPlatformValues = selectedPlatforms.map(p => p.value)
      const selectedAgentIds = selectedAgents.map(a => a._id)

      // 🧩 Check if this combination already exists in `platforms`
      const duplicate = platforms.some(
        item =>
          item.platforms.some(p => selectedPlatformValues.includes(p)) &&
          item.agents.some(a => selectedAgentIds.includes(a._id))
      )

      if (duplicate) {
        toast.error('One or more selected agents are already assigned to this platform.')
        setLoading(false)
        return
      }

      // ✅ Prepare API body if no duplicate found
      const requestBody = {
        agents: selectedAgentIds,
        platforms: selectedPlatformValues
      }

      const response = await dispatch(addPlatformsThunk(requestBody))

      if (response.meta.requestStatus === 'fulfilled') {
        toast.success('Platform assignment created successfully!')
        setSelectedAgents([])
        setSelectedPlatforms([])
      } else {
        toast.error(response.payload || 'Failed to create platform assignment')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create platform assignment')
      setError(err.message || 'Failed to create platform assignment')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = selectedAgents.length > 0 && selectedPlatforms.length > 0

  return (
    <Card>
      <CardHeader title='Platform Creation' />
      <CardContent>
        <Box className='space-y-6'>
          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* {success && <Alert severity='success'>Platform assignment created successfully!</Alert>} */}

          {/* Agents Selection */}
          <Autocomplete
            multiple
            fullWidth
            options={agents}
            getOptionLabel={option => `${option.firstName} ${option.lastName} (${option.email})`}
            value={selectedAgents}
            onChange={(event, newValue) => setSelectedAgents(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option._id}
                  label={`${option.firstName} ${option.lastName}`}
                  variant='outlined'
                />
              ))
            }
            renderInput={params => (
              <TextField
                {...params}
                label='Select Agents'
                placeholder='Choose agents for platform assignment'
                helperText={`${selectedAgents.length} agent(s) selected`}
              />
            )}
            loading={loading}
            disabled={loading}
          />

          {/* Platforms Selection */}
          <Autocomplete
            fullWidth
            options={availablePlatforms}
            getOptionLabel={option => option.label}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            value={selectedPlatforms?.[0] || null}
            onChange={(event, newValue) => setSelectedPlatforms(newValue ? [newValue] : [])}
            renderInput={params => (
              <TextField
                {...params}
                label='Select Platform'
                placeholder='Choose one platform for assignment'
                helperText={`${selectedPlatforms.length} platform(s) selected`}
              />
            )}
            loading={loading}
            disabled={loading}
          />

          {/* Submit Button */}
          <Box className='flex justify-end'>
            <Button variant='contained' onClick={handleSubmit} disabled={!isFormValid || loading} size='large'>
              {loading ? 'Creating...' : 'Create Platform Assignment'}
            </Button>
          </Box>
        </Box>
      </CardContent>
      <Divider />
      <CardHeader title='Available Platforms' subheader='From Platform API' />
      <CardContent>
        {platformsLoading ? (
          <Typography>Loading platforms...</Typography>
        ) : platforms.length === 0 ? (
          <Typography>No platforms found.</Typography>
        ) : (
          <Stack spacing={3}>
            {platforms.map((item, i) => (
              <Card key={item?._id || i} variant='outlined'>
                <CardContent>
                  <Box className='flex flex-col gap-3'>
                    <Box className='flex items-center gap-2'>
                      <Typography variant='subtitle1'>Platforms:</Typography>
                      <Box className='flex flex-wrap gap-1'>
                        {item.platforms?.map(p => (
                          <Chip key={p} label={p} size='small' variant='outlined' />
                        ))}
                      </Box>
                    </Box>
                    <Box className='flex items-start gap-2'>
                      <Typography variant='subtitle1'>Agents:</Typography>
                      <Box className='flex flex-wrap gap-1'>
                        {item.agents?.map(a => (
                          <Chip key={a._id} label={`${a.firstName} ${a.lastName}`} size='small' variant='tonal' />
                        ))}
                      </Box>
                    </Box>
                    <Typography variant='caption' color='text.secondary'>
                      Created:{' '}
                      {(() => {
                        const d = item?.createdAt ? new Date(item.createdAt) : null

                        return d ? d.toISOString().replace('T', ' ').slice(0, 19) : '—'
                      })()}{' '}
                      | Updated:{' '}
                      {(() => {
                        const d = item?.updatedAt ? new Date(item.updatedAt) : null

                        return d ? d.toISOString().replace('T', ' ').slice(0, 19) : '—'
                      })()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

export default PlatformCreationForm
