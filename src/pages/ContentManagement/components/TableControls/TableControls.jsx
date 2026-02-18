// src/components/TableControls/TableControls.jsx (ContentManagement copy)
"use client"

import { MdSearch, MdFilterList, MdRefresh } from "react-icons/md"

const inputClass = `w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                    bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                    transition-all duration-200 text-sm`

const btnClass = `inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg
                  border border-[var(--light-border)] dark:border-[var(--dark-border)]
                  text-[var(--light-text)] dark:text-[var(--dark-text)]
                  hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200`

const TableControls = ({
  searchTerm,
  setSearchTerm,
  filterOptions,
  selectedFilter,
  setSelectedFilter,
  onRefresh,
  darkMode,
  placeholder = "Search...",
  className = ""
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary-color)]">
            <MdSearch />
          </span>
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>

        {filterOptions && (
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className={`${inputClass} appearance-auto`}
            style={{ minWidth: '150px' }}
          >
            <option value="all">All</option>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        <button onClick={onRefresh} className={btnClass}>
          <MdRefresh />
          Refresh
        </button>

        <button className={btnClass}>
          <MdFilterList />
          More Filters
        </button>
      </div>
    </div>
  )
}

export default TableControls