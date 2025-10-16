// src/components/Pagination/Pagination.jsx
"use client"

import { MdChevronLeft, MdChevronRight, MdMoreHoriz } from "react-icons/md"

const Pagination = ({ 
  current, 
  total, 
  limit, 
  onChange, 
  showTotal = true,
  className = "",
  size = "md"
}) => {
  const totalPages = Math.ceil(total / limit)

  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
      range.push(i)
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (current + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  return (
    <div className={`pagination-wrapper ${className}`}>
      {showTotal && (
        <div className="pagination-info">
          Showing {Math.min((current - 1) * limit + 1, total)} to {Math.min(current * limit, total)} of {total} entries
        </div>
      )}

      <div className={`pagination-controls pagination-${size}`}>
        <button 
          className="pagination-btn pagination-prev"
          disabled={current === 1} 
          onClick={() => onChange(current - 1)}
          aria-label="Previous page"
        >
          <MdChevronLeft />
        </button>

        <div className="pagination-pages">
          {visiblePages.map((page, index) =>
            page === "..." ? (
              <span key={index} className="pagination-ellipsis">
                <MdMoreHoriz />
              </span>
            ) : (
              <button
                key={index} 
                className={`pagination-btn pagination-number ${page === current ? 'active' : ''}`}
                onClick={() => onChange(page)}
                aria-label={`Page ${page}`}
                aria-current={page === current ? 'page' : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button 
          className="pagination-btn pagination-next"
          disabled={current === totalPages} 
          onClick={() => onChange(current + 1)}
          aria-label="Next page"
        >
          <MdChevronRight />
        </button>
      </div>
    </div>
  )
}

export default Pagination