import './Paginate.css'
import ReactPaginate from 'react-paginate'

function Paginate({ pageCount, currentPage = 0, onPageChange, previousLabel = '<<', nextLabel = '>>' }) {
  return (
    <ReactPaginate
      previousLabel={previousLabel}
      nextLabel={nextLabel}
      pageCount={pageCount}
      onPageChange={onPageChange}
      forcePage={currentPage}
      containerClassName="pagination"
      activeClassName="active"
    />
  )
}

export default Paginate