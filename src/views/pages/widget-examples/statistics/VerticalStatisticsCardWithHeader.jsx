// MUI Imports
import Grid from '@mui/material/Grid2'

// Components Imports
import VerticalWithHeader from '@components/card-statistics/VerticalWithHeader'

const VerticalStatisticsCardWithHeader = ({ data }) => {
  return (
    data && (
      <Grid container spacing={6}>
        {data.map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
            <VerticalWithHeader {...item} />
          </Grid>
        ))}
      </Grid>
    )
  )
}

export default VerticalStatisticsCardWithHeader
