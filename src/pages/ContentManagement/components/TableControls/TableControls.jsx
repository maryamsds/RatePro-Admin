// src/components/TableControls/TableControls.jsx
"use client"

import { Form, InputGroup, Button } from "react-bootstrap"
import { MdSearch, MdFilterList, MdRefresh } from "react-icons/md"

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
      <div className="d-flex flex-column flex-md-row gap-3">
        <InputGroup className="flex-grow-1">
          <InputGroup.Text className={darkMode ? "bg-dark border-dark text-light" : ""}>
            <MdSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={darkMode ? "bg-dark border-dark text-light" : ""}
          />
        </InputGroup>

        {filterOptions && (
          <Form.Select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className={`flex-grow-1 ${darkMode ? "bg-dark border-dark text-light" : ""}`}
            style={{ minWidth: '150px' }}
          >
            <option value="all">All</option>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        )}

        <Button 
          variant="outline-secondary" 
          onClick={onRefresh}
          className={darkMode ? "text-light" : ""}
        >
          <MdRefresh className="me-1" />
          Refresh
        </Button>

        <Button 
          variant="outline-secondary" 
          className={darkMode ? "text-light" : ""}
        >
          <MdFilterList className="me-1" />
          More Filters
        </Button>
      </div>
    </div>
  )
}

export default TableControls