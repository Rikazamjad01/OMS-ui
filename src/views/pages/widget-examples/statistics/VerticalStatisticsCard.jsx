// MUI Imports
import Grid from '@mui/material/Grid2'

// Components Imports
import Vertical from '@components/card-statistics/Vertical'

const VerticalStatisticsCard = ({ data }) => {
  return (
    data && (
      <Grid container spacing={6}>
        {data.map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
            <Vertical {...item} />
          </Grid>
        ))}
      </Grid>
    )
  )
}

export default VerticalStatisticsCard
