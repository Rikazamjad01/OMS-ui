import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'

const TablePaginationComponent = ({ table, count, rowsPerPage, page, onPageChange }) => {

  const totalPages = Math.ceil(count / rowsPerPage)

  return (
    <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
      <Typography color='text.disabled'>
        {`Showing ${
          count === 0 ? 0 : page * rowsPerPage + 1
        } to ${Math.min((page + 1) * rowsPerPage, count)} of ${count} entries`}
      </Typography>

      {totalPages > 0 && (
        <Pagination
          shape='rounded'
          color='primary'
          variant='tonal'
          count={totalPages}
          page={page + 1}
          onChange={(event, newPage) => onPageChange(event, newPage - 1)}
          showFirstButton
          showLastButton
        />
      )}
    </div>
  )
}

export default TablePaginationComponent
