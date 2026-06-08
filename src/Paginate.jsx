import './Paginate.css'

function Paginate({ pageCount, currentPage = 1, onPageChange, previousLabel = 'Anterior', nextLabel = 'Siguiente' }) {
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1)

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        {previousLabel}
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={`pagination-button ${page === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
          disabled={page === currentPage}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        className="pagination-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= pageCount}
      >
        {nextLabel}
      </button>
    </div>
  )
}

export default Paginate