// src/components/Pagination/Pagination.jsx (ContentManagement)
"use client"

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

  const pageBtnBase = `inline-flex items-center justify-center min-w-[32px] h-8 px-2 text-sm rounded-md
                       border border-[var(--light-border)] dark:border-[var(--dark-border)]
                       transition-all duration-200 cursor-pointer`

  const pageBtnNormal = `${pageBtnBase} bg-transparent text-[var(--light-text)] dark:text-[var(--dark-text)]
                         hover:bg-gray-100 dark:hover:bg-gray-700`

  const pageBtnActive = `${pageBtnBase} bg-[var(--primary-color)] text-white border-[var(--primary-color)]`

  const pageBtnDisabled = `${pageBtnBase} opacity-40 cursor-not-allowed bg-transparent
                           text-[var(--secondary-color)]`

  return (
    <div className={`flex justify-between items-center flex-wrap gap-2 ${className}`}>
      {showTotal && (
        <small className="text-[var(--secondary-color)]">
          Showing {Math.min((current - 1) * limit + 1, total)} to {Math.min(current * limit, total)} of {total} entries
        </small>
      )}

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          disabled={current === 1}
          onClick={() => onChange(current - 1)}
          className={current === 1 ? pageBtnDisabled : pageBtnNormal}
        >
          <MdChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {visiblePages.map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-1 text-[var(--secondary-color)]">
              <MdMoreHoriz size={16} />
            </span>
          ) : (
            <button
              key={index}
              onClick={() => onChange(page)}
              className={page === current ? pageBtnActive : pageBtnNormal}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          disabled={current === totalPages}
          onClick={() => onChange(current + 1)}
          className={current === totalPages ? pageBtnDisabled : pageBtnNormal}
        >
          <MdChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default Pagination