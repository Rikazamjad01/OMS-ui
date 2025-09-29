'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import { useDispatch, useSelector } from 'react-redux'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import {
  fetchZones,
  selectZones,
  selectZonesLoading,
  createZone,
  updateZone,
  removeCity
} from '@/redux-store/slices/zonesSlice'
import cities from '@/data/cities/cities'

const courierOptions = [
  { value: 'none', label: 'None' },
  { value: 'leopard', label: 'Leopard' },
  { value: 'daewoo', label: 'Daewoo' },
  { value: 'postEx', label: 'PostEx' },
  { value: 'mp', label: 'M&P' },
  { value: 'tcs', label: 'TCS' }
]

const apiCourierToKey = {
  Leopard: 'leopard',
  Daewoo: 'daewoo',
  PostEx: 'postEx',
  'M&P': 'mp',
  TCS: 'tcs',
  None: 'none'
}

const keyToApiCourier = Object.fromEntries(Object.entries(apiCourierToKey).map(([api, key]) => [key, api]))

const regionalSequence = ['North', 'South', 'East', 'West', 'Central']

// Infer next default zone label from convention and zone index
const getZoneLabel = (convention, index) => {
  if (convention === 'numeric') return `Zone ${index}`

  const region = regionalSequence[(index - 1) % regionalSequence.length]

  return `Zone ${region}`
}

export default function ZoneSetup({ initialZone = null }) {
  const dispatch = useDispatch()
  const zones = useSelector(selectZones)
  const zonesLoading = useSelector(selectZonesLoading)

  const [convention, setConvention] = useState('numeric') // 'numeric' | 'regional'
  const [conventionLocked, setConventionLocked] = useState(false)
  const [rows, setRows] = useState([])
  const [nextZoneIndex, setNextZoneIndex] = useState(1)
  const [selectedCities, setSelectedCities] = useState([])
  const [selectedZoneId, setSelectedZoneId] = useState('')
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' })
  const [saving, setSaving] = useState(false)
  const [tabIndex, setTabIndex] = useState(0)

  // Zone options derived from store; keep above effects that depend on them
  const zoneOptions = useMemo(() => (zones || []).map(z => ({ id: z._id || z.id, label: z.name, raw: z })), [zones])

  const dedupedZoneOptions = useMemo(() => {
    const seen = new Set()

    const list = []

    ;(zoneOptions || []).forEach(z => {
      const key = z.id || z.label

      if (!key) return
      if (seen.has(key)) return
      seen.add(key)
      list.push(z)
    })
    return list
  }, [zoneOptions])

  // Load zones on mount
  useEffect(() => {
    dispatch(fetchZones())
  }, [dispatch])

  // Re-applies zone propagation after edits
  const propagateZones = useCallback(
    draftRows => {
      // Propagate zone downwards: a row with hasCustomZone acts as a boundary/start
      let currentZone = null

      for (let i = 0; i < draftRows.length; i += 1) {
        const r = draftRows[i]

        if (r.hasCustomZone) {
          currentZone = r.zone
        }

        if (!r.hasCustomZone) {
          // If there is no current custom zone yet, initialize with first zone label
          if (!currentZone) {
            currentZone = getZoneLabel(convention, 1)
          }

          r.zone = currentZone
        }
      }
    },
    [convention]
  )

  const normalizeCity = useCallback(city => (typeof city === 'string' ? city : city?.name || city?.label || ''), [])

  const addCityRows = useCallback(() => {
    const tokens = (selectedCities || [])
      .map(normalizeCity)
      .map(t => t.trim())
      .filter(Boolean)

    if (tokens.length === 0) return

    setRows(prev => {
      // Preserve existing rows including a blank boundary row
      const newRows = [...prev]

      // Determine the zone label to use for the new/filled rows
      const currentZoneLabel = newRows[0]?.zone || getZoneLabel(convention, nextZoneIndex)

      // Inherit priorities from the current zone header (first row)
      const header = newRows[0] || {}
      const inheritedP1 = header.priority1 || 'none'
      const inheritedP2 = header.priority2 || 'none'
      const inheritedP3 = header.priority3 || 'none'
      const inheritedP4 = header.priority4 || 'none'

      let startIdx = 0

      // If the first row is a boundary with empty city, fill it with the first token
      if (
        newRows.length > 0 &&
        newRows[0].hasCustomZone &&
        !Boolean(normalizeCity(newRows[0].city)) &&
        tokens.length > 0
      ) {
        // Fill the boundary row and preserve its existing priorities (already on the row)
        newRows[0] = { ...newRows[0], city: tokens[0], zone: currentZoneLabel, hasCustomZone: true }
        startIdx = 1
      }

      // Append the remaining tokens as new rows under the same zone label
      for (let i = startIdx; i < tokens.length; i += 1) {
        const city = tokens[i]

        newRows.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          zone: currentZoneLabel,
          hasCustomZone: newRows.length === 0, // first row becomes a zone boundary if none exists
          city,

          // Inherit priorities from the header row of this zone
          priority1: inheritedP1,
          priority2: inheritedP2,
          priority3: inheritedP3,
          priority4: inheritedP4
        })
      }

      // Ensure proper propagation from first boundary row
      propagateZones(newRows)

      return newRows
    })

    setSelectedCities([])
  }, [selectedCities, convention, nextZoneIndex, propagateZones, normalizeCity])

  const addZoneBreak = useCallback(() => {
    setRows(prev => {
      const newRows = [...prev]

      // Insert a new blank row that starts a new zone block
      const newZoneIndex = nextZoneIndex + 1
      const label = getZoneLabel(convention, newZoneIndex)

      newRows.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        zone: label,
        hasCustomZone: true, // this becomes a boundary for subsequent rows
        city: '',
        priority1: 'none',
        priority2: 'none',
        priority3: 'none',
        priority4: 'none'
      })

      // Propagate zones below
      propagateZones(newRows)
      return newRows
    })

    setNextZoneIndex(i => i + 1)
  }, [convention, nextZoneIndex, propagateZones])

  // Generate a unique zone label that does not already exist in server data
  const generateUniqueZoneLabel = useCallback(() => {
    const existing = new Set(
      (zones || []).map(z =>
        String(z?.name || '')
          .trim()
          .toLowerCase()
      )
    )

    if (convention === 'regional') {
      for (const region of regionalSequence) {
        const candidate = `Zone ${region}`

        if (!existing.has(candidate.toLowerCase())) return candidate
      }

      // Fallback to numeric if all regional labels are taken
    }

    // Numeric or fallback path: find the smallest Zone N not used
    for (let i = 1; i <= (zones?.length || 0) + 50; i += 1) {
      const candidate = `Zone ${i}`

      if (!existing.has(candidate.toLowerCase())) return candidate
    }

    // Last resort unique name
    return `Zone ${Date.now()}`
  }, [zones, convention])

  // Open a brand new zone editor, closing any currently opened zone
  const openNewZone = useCallback(() => {
    const label = generateUniqueZoneLabel()

    setSelectedZoneId('')
    setSelectedCities([])
    setRows([
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        zone: label,
        hasCustomZone: true,
        city: '',
        priority1: 'none',
        priority2: 'none',
        priority3: 'none',
        priority4: 'none'
      }
    ])
  }, [generateUniqueZoneLabel])

  const updateRow = useCallback(
    (rowId, updater) => {
      setRows(prev => {
        const draft = prev.map(r => (r.id === rowId ? { ...r, ...updater } : r))
        const changed = draft.find(r => r.id === rowId)

        // Zone change => mark boundary and propagate labels downward
        if (changed && Object.prototype.hasOwnProperty.call(updater, 'zone')) {
          changed.hasCustomZone = true
          propagateZones(draft)
        }

        // Priority change => apply to all rows with same zone
        const priorityKeys = ['priority1', 'priority2', 'priority3', 'priority4']
        const changedPriorityKeys = Object.keys(updater).filter(k => priorityKeys.includes(k))

        if (changed && changedPriorityKeys.length > 0) {
          const zoneLabel = changed.zone

          for (const key of changedPriorityKeys) {
            for (let i = 0; i < draft.length; i += 1) {
              if (draft[i].zone === zoneLabel) {
                draft[i] = { ...draft[i], [key]: updater[key] }
              }
            }
          }
        }

        return [...draft]
      })
    },
    [propagateZones]
  )

  const setPriorityForAll = useCallback((key, value) => {
    setRows(prev => {
      const label = prev[0]?.zone

      return prev.map(r => (r.zone === label ? { ...r, [key]: value } : r))
    })
  }, [])

  // Hydrate from backend response if provided
  const hydrateFromApi = useCallback(
    apiZone => {
      if (!apiZone) {
        // Clear form
        setRows([])
        setSelectedZoneId('')
        setConventionLocked(false)
        return
      }

      const api = apiZone.data || apiZone // support either wrapper or direct object
      const zoneLabel = api.name || getZoneLabel(convention, 1)
      const nc = api.namingConvention || convention

      setConvention(nc)
      setConventionLocked(Boolean(api.namingConvention))

      // Map couriers -> priority fields
      const prMap = { priority1: 'none', priority2: 'none', priority3: 'none', priority4: 'none' }

      ;(api.couriers || []).forEach(c => {
        const key =
          c?.priority === 'PR1'
            ? 'priority1'
            : c?.priority === 'PR2'
              ? 'priority2'
              : c?.priority === 'PR3'
                ? 'priority3'
                : c?.priority === 'PR4'
                  ? 'priority4'
                  : null

        if (key) {
          const mapped = apiCourierToKey[c?.courierName] || 'none'

          prMap[key] = mapped
        }
      })

      const cityList = (api.config?.cities || []).map(normalizeCity).filter(Boolean)

      setRows(() => {
        const newRows =
          cityList.length > 0
            ? cityList.map((city, idx) => ({
                id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
                zone: zoneLabel,
                hasCustomZone: idx === 0,
                city,
                ...prMap
              }))
            : [
                {
                  id: `${Date.now()}-0-${Math.random().toString(36).slice(2, 6)}`,
                  zone: zoneLabel,
                  hasCustomZone: true,
                  city: '',
                  ...prMap
                }
              ]

        // With a fixed zone label provided, keep it as boundary and propagate
        propagateZones(newRows)

        return newRows
      })

      // Prepare next numeric index if needed
      if (nc === 'numeric') {
        const maybeIndex = Number(String(zoneLabel).replace(/[^\d]/g, ''))

        if (!Number.isNaN(maybeIndex) && maybeIndex >= 1) setNextZoneIndex(maybeIndex + 1)
      }
    },
    [convention, normalizeCity, propagateZones]
  )

  // Delete row (moved below hydrateFromApi to avoid TDZ)
  const deleteRow = useCallback(
    async rowId => {
      // Find the row being deleted
      const row = rows.find(r => r.id === rowId)
      const cityName = normalizeCity(row?.city)

      // Determine if this city exists on the server for the currently selected zone
      const currentZone = (zones || []).find(z => (z._id || z.id) === selectedZoneId)
      const serverCitySet = new Set((currentZone?.config?.cities || []).map(normalizeCity).filter(Boolean))
      const shouldCallApi = Boolean(selectedZoneId && cityName && serverCitySet.has(cityName))

      try {
        // Optimistically update UI
        setRows(prev => prev.filter(r => r.id !== rowId))

        if (shouldCallApi) {
          await dispatch(removeCity({ id: selectedZoneId, city: cityName })).unwrap()
          setAlert({ open: true, message: 'City removed from zone', severity: 'success' })

          // Refresh zones and rehydrate currently selected zone using latest payload (not stale selector)
          const latestZones = await dispatch(fetchZones()).unwrap()
          const refreshed = (latestZones || []).find(z => (z._id || z.id) === selectedZoneId)

          if (refreshed) hydrateFromApi(refreshed)
        }
      } catch (e) {
        setAlert({ open: true, message: e?.message || 'Failed to remove city', severity: 'error' })

        // On failure, re-fetch to reconcile UI with server state from latest payload
        const latestZones = await dispatch(fetchZones()).unwrap()
        const refreshed = (latestZones || []).find(z => (z._id || z.id) === selectedZoneId)

        if (refreshed) hydrateFromApi(refreshed)
      }
    },
    [dispatch, rows, selectedZoneId, zones, normalizeCity, hydrateFromApi]
  )

  useEffect(() => {
    if (initialZone) hydrateFromApi(initialZone)
  }, [initialZone, hydrateFromApi])

  // Auto-open the first zone by default when arriving on the page
  useEffect(() => {
    if (!initialZone && !selectedZoneId && (dedupedZoneOptions || []).length > 0 && rows.length === 0) {
      const first = dedupedZoneOptions[0]

      setSelectedZoneId(first.id)
      if (first.raw) hydrateFromApi(first.raw)
      setTabIndex(0)
    }
  }, [dedupedZoneOptions, selectedZoneId, rows.length, initialZone, hydrateFromApi])

  // Keep tabIndex in sync with selectedZoneId using the deduped list
  useEffect(() => {
    const idx = (dedupedZoneOptions || []).findIndex(z => z.id === selectedZoneId)

    if (idx >= 0) {
      setTabIndex(idx)
    } else if ((dedupedZoneOptions || []).length > 0) {
      setTabIndex(0)
      setSelectedZoneId(dedupedZoneOptions[0].id)
    } else {
      setTabIndex(0)
      setSelectedZoneId('')
    }
  }, [dedupedZoneOptions, selectedZoneId])

  // Select an existing zone via tabs and hydrate
  const handleConventionChange = useCallback(
    e => {
      const value = e.target.value

      setConvention(value)

      // Reset zones to new convention and re-propagate
      setRows(prev => {
        const draft = prev.map((r, i) => {
          // Preserve custom boundaries, just relabel
          if (r.hasCustomZone) {
            return { ...r, zone: getZoneLabel(value, i + 1) }
          }

          return { ...r }
        })

        propagateZones(draft)
        return draft
      })
    },
    [propagateZones]
  )

  const cityOptions = useMemo(() => {
    // Support arrays of strings or objects
    return (cities || []).map(c =>
      typeof c === 'string'
        ? { label: c, value: c }
        : { label: c?.name || c?.label || '', value: c?.value || c?.name || c?.label || '' }
    )
  }, [])

  // All cities used anywhere (from server + current rows) should be excluded from options
  const usedCitiesSet = useMemo(() => {
    const set = new Set()

    ;(zones || []).forEach(z => (z?.config?.cities || []).forEach(c => set.add(normalizeCity(c))))
    rows.forEach(r => {
      const n = normalizeCity(r.city)

      if (n) set.add(n)
    })
    return set
  }, [zones, rows, normalizeCity])

  const selectedLabelSet = useMemo(() => {
    const set = new Set()

    ;(selectedCities || []).forEach(c => set.add(normalizeCity(c)))
    return set
  }, [selectedCities, normalizeCity])

  const filteredCityOptions = useMemo(() => {
    return cityOptions.filter(opt => !usedCitiesSet.has(opt.label) && !selectedLabelSet.has(opt.label))
  }, [cityOptions, usedCitiesSet, selectedLabelSet])

  const canAddCity = useMemo(() => (selectedCities || []).length > 0, [selectedCities])

  const buildPayloadFromRows = useCallback(() => {
    const name = rows[0]?.zone || getZoneLabel(convention, nextZoneIndex)
    const uniqueCities = Array.from(new Set(rows.map(r => normalizeCity(r.city)).filter(Boolean)))
    const head = rows[0] || {}
    const priorities = [head.priority1, head.priority2, head.priority3, head.priority4]

    const couriers = priorities
      .map((k, idx) => ({ key: k || 'none', pr: `PR${idx + 1}` }))
      .filter(p => p.key && p.key !== 'none')

    const couriersApi = couriers.map(p => ({ priority: p.pr, courierName: keyToApiCourier[p.key] || 'None' }))

    const payload = { name, cities: uniqueCities, couriers: couriersApi }

    // Include namingConvention only if there are no zones yet
    if (!selectedZoneId && (zones || []).length === 0) {
      payload.namingConvention = convention
    }

    return payload
  }, [rows, convention, nextZoneIndex, normalizeCity, zones, selectedZoneId])

  const handleSave = useCallback(async () => {
    try {
      setSaving(true)
      const payload = buildPayloadFromRows()

      if (!selectedZoneId) {
        // Create
        payload.namingConvention = convention
        const created = await dispatch(createZone(payload)).unwrap()

        setAlert({ open: true, message: 'Zone created successfully', severity: 'success' })
        await dispatch(fetchZones())

        // Hydrate created zone
        setSelectedZoneId(created?._id || created?.id || '')
        hydrateFromApi(created)
      } else {
        // Update
        const updated = await dispatch(
          updateZone({ id: selectedZoneId, cities: payload.cities, couriers: payload.couriers })
        ).unwrap()

        setAlert({ open: true, message: 'Zone updated successfully', severity: 'success' })
        await dispatch(fetchZones())
        hydrateFromApi(updated)
      }
    } catch (e) {
      console.log(e, 'error in handleSave')
      setAlert({ open: true, message: e?.message || 'Failed to save zone', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }, [dispatch, selectedZoneId, buildPayloadFromRows, hydrateFromApi])

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <Typography variant='h5'>Zone Setup</Typography>

        <Grid container spacing={2} alignItems='center'>
          {/* Radio Group full width */}
          <Grid xs={12} md={10} className='flex items-center'>
            <FormLabel component='legend' className='mr-4'>
              Naming convention
            </FormLabel>
            <RadioGroup row value={convention} onChange={handleConventionChange} className='flex-grow'>
              <FormControlLabel value='numeric' control={<Radio />} label='Numeric' disabled={conventionLocked} />
              <FormControlLabel value='regional' control={<Radio />} label='Regional' disabled={conventionLocked} />
            </RadioGroup>
          </Grid>

          {/* Button aligned right */}
          <Grid xs={12} md={2} className='flex justify-end'>
            <Tooltip title='Start a new Zone block'>
              <Button variant='outlined' color='primary' onClick={openNewZone} startIcon={<AddIcon />}>
                Add Zone
              </Button>
            </Tooltip>
          </Grid>
        </Grid>

        <Divider />

        {/* Zone selector tabs */}
        <Tabs
          value={Math.min(tabIndex, Math.max(0, (dedupedZoneOptions?.length || 1) - 1))}
          onChange={(_e, idx) => {
            setTabIndex(idx)
            const item = dedupedZoneOptions[idx]

            if (item) {
              setSelectedZoneId(item.id)
              if (item.raw) hydrateFromApi(item.raw)
            }
          }}
          variant='scrollable'
          scrollButtons='auto'
        >
          {(dedupedZoneOptions || []).map((z, i) => (
            <Tab key={`zone-${z.id || z.label || i}`} label={z.label} />
          ))}
        </Tabs>

        <Divider />

        <Grid container spacing={3} alignItems='center'>
          <Grid size={{ xs: 12, md: 9 }}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={filteredCityOptions}
              getOptionLabel={option => option.label}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              getOptionDisabled={option => usedCitiesSet.has(option.label) || selectedLabelSet.has(option.label)}
              value={(selectedCities || []).map(c => {
                const label = normalizeCity(c)

                return { label, value: label }
              })}
              onChange={(_e, newValue) => setSelectedCities(newValue)}
              filterSelectedOptions
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option.value || index} label={option.label} />
                ))
              }
              renderInput={params => (
                <TextField {...params} fullWidth label='Select cities' placeholder='Search cities and select' />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }} className='flex items-start gap-2'>
            <Button variant='contained' onClick={addCityRows} disabled={!canAddCity} className='max-sm:is-full'>
              Add City Rows
            </Button>
          </Grid>
        </Grid>

        <TableContainer component={Paper}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell width={220}>Zone</TableCell>
                <TableCell width={260}>City</TableCell>
                <TableCell>
                  Priority 1
                  <TextField
                    select
                    fullWidth
                    size='small'
                    value={rows[0]?.priority1 || 'none'}
                    onChange={e => setPriorityForAll('priority1', e.target.value)}
                  >
                    {courierOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  Priority 2
                  <TextField
                    select
                    fullWidth
                    size='small'
                    value={rows[0]?.priority2 || 'none'}
                    onChange={e => setPriorityForAll('priority2', e.target.value)}
                  >
                    {courierOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  Priority 3
                  <TextField
                    select
                    fullWidth
                    size='small'
                    value={rows[0]?.priority3 || 'none'}
                    onChange={e => setPriorityForAll('priority3', e.target.value)}
                  >
                    {courierOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  Priority 4
                  <TextField
                    select
                    fullWidth
                    size='small'
                    value={rows[0]?.priority4 || 'none'}
                    onChange={e => setPriorityForAll('priority4', e.target.value)}
                  >
                    {courierOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center'>
                    No rows yet. Add cities to begin.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <TextField
                        fullWidth
                        label='Zone'
                        value={row.zone}
                        onChange={e => updateRow(row.id, { zone: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        label='City'
                        placeholder='Enter city'
                        value={row.city}
                        onChange={e => updateRow(row.id, { city: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={row.priority1 || 'none'} size='small' />
                    </TableCell>
                    <TableCell>
                      <Chip label={row.priority2 || 'none'} size='small' />
                    </TableCell>
                    <TableCell>
                      <Chip label={row.priority3 || 'none'} size='small' />
                    </TableCell>
                    <TableCell>
                      <Chip label={row.priority4 || 'none'} size='small' />
                    </TableCell>
                    <TableCell align='right'>
                      <Tooltip title='Delete row'>
                        <IconButton color='error' onClick={() => deleteRow(row.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <div className='flex justify-end gap-2'>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => {
              setRows([])
              setNextZoneIndex(1)
            }}
          >
            Reset
          </Button>
          <Button variant='contained' onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Zones'}
          </Button>
        </div>
      </CardContent>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={alert.severity} variant='filled' onClose={() => setAlert(prev => ({ ...prev, open: false }))}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Card>
  )
}
