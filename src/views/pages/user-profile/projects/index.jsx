// MUI Imports
import Grid from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import AvatarGroup from '@mui/material/AvatarGroup'
import Tooltip from '@mui/material/Tooltip'

// Component Imports
import { Checkbox } from '@mui/material'

import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'
import Link from '@components/Link'
import ProjectTables from '../profile/ProjectsTables'
import BaseTable from '../baseTable/page'

const Projects = ({ data }) => {
  // convert data into an array if it's not already
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
      header: 'Order Date',
      cell: ({ row }) => <Typography color='text.primary'>{new Date(row.original.createdAt).toDateString()}</Typography>
    },
    {
      accessorKey: 'platform',
      header: 'Platform',
      cell: ({ row }) => <Chip label={row.original.platform || 'Shopify'} />,
      enableSorting: false
    },
    {
      accessorKey: 'status',
      header: 'Progress',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <LinearProgress color='primary' value={row.original.status || 0} variant='determinate' className='is-20' />
          <Typography color='text.primary'>{`${row.original.status || 0}%`}</Typography>
        </div>
      )
    },
    {
      accessorKey: 'amount',
      header: 'Incentive Amount',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <Typography color='text.primary' >{`${row.original.amount || 0}`}</Typography>
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

  console.log(data, 'data in projects')

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

export default Projects
