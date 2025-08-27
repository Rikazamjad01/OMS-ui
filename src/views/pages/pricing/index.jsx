'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

// Component Imports
import Pricing from '@components/pricing'

const PricingPage = ({ data }) => {
  return (
    <Card>
      <CardContent>
        <Pricing data={data} />
      </CardContent>
    </Card>
  )
}

export default PricingPage
