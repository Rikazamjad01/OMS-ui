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
import EditIcon from '@mui/icons-material/Edit'
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
import {
  fetchCouriers,
  selectActiveCouriers,
  selectCouriers,
  selectCouriersLoading
} from '@/redux-store/slices/couriers'

const courierOptions = [
  { value: 'none', label: 'None' },
  { value: 'leopard', label: 'Leopard' },
  { value: 'daewoo', label: 'Daewoo' },
  { value: 'postEx', label: 'PostEx' },
  { value: 'm&p', label: 'M&P' },
  { value: 'tcs', label: 'TCS' }
]

const apiCourierToKey = {
  Leopard: 'leopard',
  Daewoo: 'daewoo',
  PostEx: 'postEx',
  'M&P': 'm&p',
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
  const [prioritiesEditable, setPrioritiesEditable] = useState(false)
  const [editingRowId, setEditingRowId] = useState('')

  // Zone options derived from store; keep above effects that depend on them
  const zoneOptions = useMemo(() => (zones || []).map(z => ({ id: z._id || z.id, label: z.name, raw: z })), [zones])

  const couriers = useSelector(selectCouriers)
  const courierLoading = useSelector(selectCouriersLoading)
  const activeCouriersFromStore = useSelector(selectActiveCouriers) || []

  // Fetch active couriers if not loaded
  useEffect(() => {
    if ((!couriers || couriers.length === 0) && !courierLoading) {
      dispatch(fetchCouriers({ active: true, force: true }))
    }
  }, [couriers, courierLoading, dispatch])

  // Map exactly what comes from backend
  const activeCouriers = useMemo(() => {
    if (!Array.isArray(activeCouriersFromStore)) return []
    return activeCouriersFromStore.map(courier => ({
      id: courier.id ?? courier._id,
      label: courier.name ?? courier.platform ?? 'Unnamed Courier',
      value: courier.name ?? courier.platform ?? courier.id // ✅ real API name
    }))
  }, [activeCouriersFromStore])

  // Include "None" as default + all active couriers
  const courierOptions = useMemo(() => {
    return [{ value: 'none', label: 'None' }, ...activeCouriers]
  }, [activeCouriers])

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

  const dynamicTabs = useMemo(() => {
    const list = [...dedupedZoneOptions]

    // If we're in "creating new zone" mode (no selectedZoneId and we have rows),
    // show a trailing "new" tab using the first row's zone label.
    if (!selectedZoneId && rows.length > 0) {
      list.push({
        id: '__new__',
        label: rows[0]?.zone || 'New Zone',
        raw: undefined
      })
    }

    return list
  }, [dedupedZoneOptions, selectedZoneId, rows])

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

    // Clear the selected zone ID to indicate new zone creation
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

    // Set tabIndex to indicate we're creating a new zone (beyond existing tabs)
    setTabIndex(dedupedZoneOptions.length)
  }, [generateUniqueZoneLabel, dedupedZoneOptions.length])

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
          prMap[key] = c?.courierName || 'none'
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
    if (
      !initialZone &&
      !selectedZoneId &&
      (dedupedZoneOptions || []).length > 0 &&
      rows.length === 0 &&
      tabIndex < dedupedZoneOptions.length
    ) {
      const first = dedupedZoneOptions[0]

      setSelectedZoneId(first.id)
      if (first.raw) hydrateFromApi(first.raw)
      setTabIndex(0)
    }
  }, [dedupedZoneOptions, selectedZoneId, rows.length, initialZone, hydrateFromApi])

  // Keep tabIndex in sync with selectedZoneId using the deduped list
  useEffect(() => {
    const findId = selectedZoneId || '__new__'
    const idx = (dynamicTabs || []).findIndex(z => z.id === findId)

    if (idx >= 0) {
      setTabIndex(idx)
      return
    }

    const firstExistingIdx = (dynamicTabs || []).findIndex(z => z.id !== '__new__')

    if (firstExistingIdx >= 0) {
      setTabIndex(firstExistingIdx)
      setSelectedZoneId(dynamicTabs[firstExistingIdx].id)
    } else if ((dynamicTabs || []).length > 0) {
      // only the new tab exists
      setTabIndex(dynamicTabs.length - 1)
      setSelectedZoneId('')
    } else {
      setTabIndex(0)
      setSelectedZoneId('')
    }
  }, [dynamicTabs, selectedZoneId])

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

  // const filteredCityOptions = useMemo(() => {
  //   return cityOptions.filter(opt => !usedCitiesSet.has(opt.label) || !selectedLabelSet.has(opt.label))
  // }, [cityOptions, usedCitiesSet, selectedLabelSet])
  // console.log(rows, 'rows here')

  // console.log(cityOptions, 'cityOptions here')

  const filteredCityOptions = useMemo(() => {
    // Get all cities that are currently used in ANY zone (from server data)
    const allUsedCities = new Set()

    // Add cities from all zones in the store
    ;(zones || []).forEach(zone => {
      ;(zone.config?.cities || []).forEach(city => {
        allUsedCities.add(normalizeCity(city).toLowerCase())
      })
    })

    // Add cities from current rows (being edited)
    rows.forEach(row => {
      const city = normalizeCity(row.city)

      if (city) {
        allUsedCities.add(city.toLowerCase())
      }
    })

    // Filter cityOptions to exclude any cities that are already used
    return cityOptions.filter(opt => !allUsedCities.has(opt.label.toLowerCase()))
  }, [cityOptions, zones, rows, normalizeCity])

  const canAddCity = useMemo(() => (selectedCities || []).length > 0, [selectedCities])

  const buildPayloadFromRows = useCallback(() => {
    // For new zones, use the zone name from the first row
    // For existing zones, use the current selected zone's name
    const name = selectedZoneId
      ? zoneOptions.find(z => z.id === selectedZoneId)?.label
      : rows[0]?.zone || getZoneLabel(convention, nextZoneIndex)

    const uniqueCities = Array.from(new Set(rows.map(r => normalizeCity(r.city)).filter(Boolean)))
    const head = rows[0] || {}
    const priorities = [head.priority1, head.priority2, head.priority3, head.priority4]

    const couriers = priorities
      .map((key, idx) => {
        const match = courierOptions.find(c => c.value === key)

        return {
          key: key || 'none',
          id: match?.id || null,
          pr: `PR${idx + 1}`
        }
      })
      .filter(p => p.key && p.key !== 'none')

    const couriersApi = couriers.map(p => ({
      priority: p.pr,
      courierName: p.id
    }))

    const payload = {
      name,
      cities: uniqueCities,
      couriers: couriersApi
    }

    // Always include namingConvention for new zones
    if (!selectedZoneId) {
      payload.namingConvention = convention
    }

    return payload
  }, [rows, convention, nextZoneIndex, normalizeCity, zones, selectedZoneId, zoneOptions])

  const handleSave = useCallback(async () => {
    try {
      setSaving(true)

      const currentZoneName = rows[0]?.zone
      const payload = buildPayloadFromRows()

      if (!selectedZoneId) {
        // Create - pass the name explicitly
        const created = await dispatch(createZone({ ...payload, name: currentZoneName })).unwrap()

        setAlert({ open: true, message: 'Zone created successfully', severity: 'success' })
        await dispatch(fetchZones())

        // The created zone should now have the correct name due to our client-side override
        setSelectedZoneId(created?._id || created?.id || '')
      } else {
        // Update - also pass the name to ensure it's preserved
        const updated = await dispatch(
          updateZone({
            id: selectedZoneId,
            cities: payload.cities,
            couriers: payload.couriers,
            name: currentZoneName
          })
        ).unwrap()

        setAlert({ open: true, message: 'Zone updated successfully', severity: 'success' })

        await dispatch(fetchZones())

        // hydrateFromApi(updated)
      }
    } catch (e) {
      console.error('Error in handleSave:', e)
      setAlert({ open: true, message: e?.message || 'Failed to save zone', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }, [dispatch, selectedZoneId, buildPayloadFromRows, hydrateFromApi, rows])

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
          <Grid xs={12} md={2} className='flex justify-end gap-2'>
            <Tooltip title='Toggle priority editing for this zone'>
              <Button variant='outlined' color='secondary' onClick={() => setPrioritiesEditable(p => !p)}>
                {prioritiesEditable ? 'Lock Priority' : 'Change Priority'}
              </Button>
            </Tooltip>
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
          value={Math.min(tabIndex, Math.max(0, (dynamicTabs?.length || 1) - 1))}
          onChange={(_e, idx) => {
            setTabIndex(idx)
            const item = dynamicTabs[idx]

            if (!item) return

            // If the user clicked the "new zone" pseudo-tab, keep selectedZoneId empty
            if (item.id === '__new__') {
              setSelectedZoneId('')

              // no hydrateFromApi for a new zone
            } else {
              setSelectedZoneId(item.id)
              if (item.raw) hydrateFromApi(item.raw)
            }
          }}
          variant='scrollable'
          scrollButtons='auto'
        >
          {(dynamicTabs || []).map((z, i) => (
            <Tab key={`zone-${z.id || z.label || i}`} label={z.label} />
          ))}
        </Tabs>

        {/* <Divider /> */}

        <Grid container spacing={3} alignItems='center'>
          <Grid size={{ xs: 12, md: 9 }}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={filteredCityOptions}
              getOptionLabel={option => option.label}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              getOptionDisabled={option => usedCitiesSet.has(option.label) || selectedLabelSet.has(option.label)}
              value={selectedCities}
              onChange={(_e, newValue) => setSelectedCities(newValue || [])}
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
                    disabled={!prioritiesEditable}
                  >
                    {courierOptions.map(opt => {
                      const p2 = rows[0]?.priority2
                      const p3 = rows[0]?.priority3
                      const p4 = rows[0]?.priority4
                      const taken = [p2, p3, p4].includes(opt.value)

                      return (
                        <MenuItem key={opt.value} value={opt.value} disabled={taken && opt.value !== 'none'}>
                          {opt.label}
                        </MenuItem>
                      )
                    })}
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
                    disabled={!prioritiesEditable}
                  >
                    {courierOptions.map(opt => {
                      const p1 = rows[0]?.priority1
                      const p3 = rows[0]?.priority3
                      const p4 = rows[0]?.priority4
                      const taken = [p1, p3, p4].includes(opt.value)

                      return (
                        <MenuItem key={opt.value} value={opt.value} disabled={taken && opt.value !== 'none'}>
                          {opt.label}
                        </MenuItem>
                      )
                    })}
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
                    disabled={!prioritiesEditable}
                  >
                    {courierOptions.map(opt => {
                      const p1 = rows[0]?.priority1
                      const p2 = rows[0]?.priority2
                      const p4 = rows[0]?.priority4
                      const taken = [p1, p2, p4].includes(opt.value)

                      return (
                        <MenuItem key={opt.value} value={opt.value} disabled={taken && opt.value !== 'none'}>
                          {opt.label}
                        </MenuItem>
                      )
                    })}
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
                    disabled={!prioritiesEditable}
                  >
                    {courierOptions.map(opt => {
                      const p1 = rows[0]?.priority1
                      const p2 = rows[0]?.priority2
                      const p3 = rows[0]?.priority3
                      const taken = [p1, p2, p3].includes(opt.value)

                      return (
                        <MenuItem key={opt.value} value={opt.value} disabled={taken && opt.value !== 'none'}>
                          {opt.label}
                        </MenuItem>
                      )
                    })}
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
                      <Typography className='font-medium'>{row.zone}</Typography>
                    </TableCell>
                    <TableCell>
                      {editingRowId === row.id ? (
                        <Autocomplete
                          autoFocus
                          fullWidth
                          disableClearable
                          options={filteredCityOptions}
                          getOptionLabel={option => option.label}
                          isOptionEqualToValue={(option, value) => option.value === value.value}
                          getOptionDisabled={option => usedCitiesSet.has(option.label)}
                          defaultValue={{ label: normalizeCity(row.city), value: normalizeCity(row.city) }}
                          onChange={(_e, newValue) => {
                            const label = newValue?.label || ''

                            if (label) updateRow(row.id, { city: label })
                            setEditingRowId('')
                          }}
                          onBlur={() => setEditingRowId('')}
                          renderInput={params => (
                            <TextField {...params} fullWidth label='Edit city' placeholder='Search city' />
                          )}
                        />
                      ) : (
                        <Typography className='font-medium'>{normalizeCity(row.city) || '-'}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={courierOptions.find(opt => opt.value === row.priority1)?.label || 'none'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={courierOptions.find(opt => opt.value === row.priority2)?.label || 'none'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={courierOptions.find(opt => opt.value === row.priority3)?.label || 'none'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={courierOptions.find(opt => opt.value === row.priority4)?.label || 'none'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell align='right' className='flex gap-2'>
                      <Tooltip title='Delete row'>
                        <IconButton color='error' onClick={() => deleteRow(row.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Edit city'>
                        <IconButton color='primary' onClick={() => setEditingRowId(row.id)}>
                          <EditIcon />
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
