// src/components/Pagination/Pagination.jsx
"use client"

import { Pagination as BootstrapPagination } from "react-bootstrap"
import { MdChevronLeft, MdChevronRight, MdMoreHoriz } from "react-icons/md"

const Pagination = ({ 
  current, 
  total, 
  limit, 
  onChange, 
  darkMode,
  showTotal = true,
  className = "",
  size = "sm"
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
    <div className={`d-flex justify-content-between align-items-center flex-wrap ${className}`}>
      {showTotal && (
        <small className={`text-muted mb-2 mb-md-0 ${darkMode ? "text-light" : ""}`}>
          Showing {Math.min((current - 1) * limit + 1, total)} to {Math.min(current * limit, total)} of {total} entries
        </small>
      )}

      <BootstrapPagination size={size} className="mb-0 pagination-enhanced">
        <BootstrapPagination.Prev 
          disabled={current === 1} 
          onClick={() => onChange(current - 1)}
          className={darkMode ? "text-light" : ""}
        >
          <MdChevronLeft size={16} />
        </BootstrapPagination.Prev>

        {visiblePages.map((page, index) =>
          page === "..." ? (
            <BootstrapPagination.Ellipsis key={index} className={darkMode ? "text-light" : ""}>
              <MdMoreHoriz size={16} />
            </BootstrapPagination.Ellipsis>
          ) : (
            <BootstrapPagination.Item 
              key={index} 
              active={page === current} 
              onClick={() => onChange(page)}
              className={darkMode ? page === current ? "" : "text-light" : ""}
            >
              {page}
            </BootstrapPagination.Item>
          )
        )}

        <BootstrapPagination.Next 
          disabled={current === totalPages} 
          onClick={() => onChange(current + 1)}
          className={darkMode ? "text-light" : ""}
        >
          <MdChevronRight size={16} />
        </BootstrapPagination.Next>
      </BootstrapPagination>
    </div>
  )
}

export default Pagination