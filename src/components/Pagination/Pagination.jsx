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

  const buttonSize = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-12 h-12 text-lg' : 'w-10 h-10 text-base';

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 w-full ${className}`}>
      {showTotal && (
        <div className="text-sm text-[var(--text-secondary)]">
          Showing {Math.min((current - 1) * limit + 1, total)} to {Math.min(current * limit, total)} of {total} entries
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          className={`inline-flex items-center justify-center ${buttonSize} rounded-md font-medium
                     border border-[var(--light-border)] dark:border-[var(--dark-border)]
                     text-[var(--light-text)] dark:text-[var(--dark-text)]
                     bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                     hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-300`}
          disabled={current === 1}
          onClick={() => onChange(current - 1)}
          aria-label="Previous page"
        >
          <MdChevronLeft />
        </button>

        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) =>
            page === "..." ? (
              <span key={index} className={`inline-flex items-center justify-center ${buttonSize}
                                            text-[var(--text-secondary)]`}>
                <MdMoreHoriz />
              </span>
            ) : (
              <button
                key={index}
                className={`inline-flex items-center justify-center ${buttonSize} rounded-md font-medium
                           border transition-colors duration-300
                           ${page === current
                    ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]'
                    : 'border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]'
                  }`}
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
          className={`inline-flex items-center justify-center ${buttonSize} rounded-md font-medium
                     border border-[var(--light-border)] dark:border-[var(--dark-border)]
                     text-[var(--light-text)] dark:text-[var(--dark-text)]
                     bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                     hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-300`}
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