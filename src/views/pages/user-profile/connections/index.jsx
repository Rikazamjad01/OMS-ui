// MUI Imports
import Grid from '@mui/material/Grid2'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Component Imports
import { Checkbox, LinearProgress } from '@mui/material'

import OptionMenu from '@core/components/option-menu'
import Link from '@components/Link'
import CustomIconButton from '@core/components/mui/IconButton'
import ProjectTables from '../profile/ProjectsTables'
import CustomAvatar from '@/@core/components/mui/Avatar'
import BaseTable from '../baseTable/page'

const Connections = ({ data }) => {
  console.log(data, 'data in connections')

  if (!Array.isArray(data)) {
    data = [data]
  }

  const orderColumns = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          indeterminate={row.getIsSomeSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      )
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <Typography color='text.primary'>{new Date(row.original.createdAt).toDateString()}</Typography>
    },
    {
      accessorKey: 'product',
      header: 'Product',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <CustomAvatar src={row.original.avatar || '/images/products/productPlaceholder.png'} size={34} />
          <div className='flex flex-col'>
            <Typography variant='h6'>{row.original.name || 'Product Name'}</Typography>
            <Typography variant='body2'>{row.original.platform || 'Shopify'}</Typography>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'platform',
      header: 'Platform',
      cell: ({ row }) => <Chip label={row.original.platform || 'Shopify'} />,
      enableSorting: false
    },
    {
      accessorKey: 'commissionStatus',
      header: 'Status of Commmission',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <Chip color='text.primary' varent='tonal' >{row.original.status || 'Pending'}</Chip>
        </div>
      )
    },
    {
      accessorKey: 'amountStatus',
      header: 'Commission amount',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <Typography color='text.primary'>{`${row.original.status || 0}`}</Typography>
        </div>
      )
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: () => (
        <OptionMenu
          iconButtonProps={{ size: 'medium' }}
          iconClassName='text-textSecondary'
          options={[
            'Details',
            'Archive',
            { divider: true },
            { text: 'Delete', menuItemProps: { className: 'text-error' } }
          ]}
        />
      ),
      enableSorting: false
    }
  ]

  return (
    <Grid container spacing={6}>
      {data && (
        <Grid size={{ xs: 12 }}>
          <BaseTable title='Daily Order List' data={data} columns={orderColumns} />
        </Grid>
      )}
    </Grid>
  )
}

export default Connections
