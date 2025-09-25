import Grid from '@mui/material/Grid2'

import { Checkbox, Chip, LinearProgress, Typography } from '@mui/material'

import BaseTable from '../baseTable/page'
import OptionMenu from '@/@core/components/option-menu'
import CustomAvatar from '@/@core/components/mui/Avatar'

const Teams = ({ data }) => {
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
      accessorKey: 'title',
      header: 'Name',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <CustomAvatar src={row.original.avatar || '/images/avatars/placeholder.jpg'} size={34} />
          <div className='flex flex-col'>
            <Typography variant='h6'>{row.original.firstName + ' ' + row.original.lastName}</Typography>
            <Typography variant='body2'>{row.original.role.name}</Typography>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'date',
      header: 'Date',
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

export default Teams
