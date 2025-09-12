import { Box, TextField } from '@mui/material'

export default DateRangeFilter = ({ filters, setFilters }) => {
  return (
    <Box display="flex" gap={2} alignItems="center">
      <TextField
        type="date"
        size="small"
        label="Start Date"
        value={filters.startDate || ''}
        onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        type="date"
        size="small"
        label="End Date"
        value={filters.endDate || ''}
        onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
        InputLabelProps={{ shrink: true }}
      />
    </Box>
  )
}
