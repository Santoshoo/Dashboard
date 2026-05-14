/**
 * Calculate total pages based on total items and items per page
 * @param {number} totalItems - Total number of items
 * @param {number} itemsPerPage - Items to display per page
 * @returns {number} Total number of pages
 */
export const calculateTotalPages = (totalItems, itemsPerPage) => {
  return Math.ceil(totalItems / itemsPerPage);
};

/**
 * Get paginated data from an array
 * @param {Array} data - Array of items to paginate
 * @param {number} currentPage - Current page number (1-based)
 * @param {number} itemsPerPage - Items per page
 * @returns {Array} Sliced data for the current page
 */
export const getPaginatedData = (data, currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
};

/**
 * Generate page numbers for pagination display
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {number} maxButtons - Maximum number of page buttons to display
 * @returns {Array} Array of page numbers and ellipsis indicators
 */
export const generatePageNumbers = (currentPage, totalPages, maxButtons = 5) => {
  const pages = [];
  
  if (totalPages <= maxButtons) {
    // Show all pages if total is less than max buttons
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);
    
    // Calculate start and end of middle range
    const halfButtons = Math.floor((maxButtons - 3) / 2);
    let startPage = Math.max(2, currentPage - halfButtons);
    let endPage = Math.min(totalPages - 1, currentPage + halfButtons);
    
    // Adjust if near the beginning
    if (currentPage <= halfButtons + 1) {
      endPage = maxButtons - 2;
    }
    
    // Adjust if near the end
    if (currentPage > totalPages - halfButtons - 1) {
      startPage = totalPages - (maxButtons - 2);
    }
    
    // Add ellipsis and middle pages
    if (startPage > 2) {
      pages.push('...');
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    
    // Always show last page
    pages.push(totalPages);
  }
  
  return pages;
};

/**
 * Validate page number
 * @param {number} page - Page number to validate
 * @param {number} totalPages - Total pages available
 * @returns {number} Valid page number
 */
export const validatePageNumber = (page, totalPages) => {
  if (!page || page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
};

/**
 * Get pagination info object
 * @param {number} currentPage - Current page
 * @param {number} totalPages - Total pages
 * @param {number} itemsPerPage - Items per page
 * @param {number} totalItems - Total items
 * @returns {Object} Pagination info
 */
export const getPaginationInfo = (currentPage, totalPages, itemsPerPage, totalItems) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  return {
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    startItem: totalItems > 0 ? startItem : 0,
    endItem: totalItems > 0 ? endItem : 0,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};

/**
 * Filter and paginate data
 * @param {Array} data - Array of items
 * @param {Function} filterFn - Filter function
 * @param {number} currentPage - Current page
 * @param {number} itemsPerPage - Items per page
 * @returns {Object} Object with filtered data and pagination info
 */
export const filterAndPaginate = (data, filterFn, currentPage, itemsPerPage) => {
  const filteredData = data.filter(filterFn);
  const totalItems = filteredData.length;
  const totalPages = calculateTotalPages(totalItems, itemsPerPage);
  const validPage = validatePageNumber(currentPage, totalPages);
  const paginatedData = getPaginatedData(filteredData, validPage, itemsPerPage);
  
  return {
    data: paginatedData,
    totalItems,
    totalPages,
    currentPage: validPage,
    paginationInfo: getPaginationInfo(validPage, totalPages, itemsPerPage, totalItems),
  };
};

/**
 * Sort and paginate data
 * @param {Array} data - Array of items
 * @param {string} sortKey - Key to sort by
 * @param {string} sortOrder - 'asc' or 'desc'
 * @param {number} currentPage - Current page
 * @param {number} itemsPerPage - Items per page
 * @returns {Object} Object with sorted and paginated data
 */
export const sortAndPaginate = (data, sortKey, sortOrder, currentPage, itemsPerPage) => {
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    
    if (typeof aValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });
  
  const totalItems = sortedData.length;
  const totalPages = calculateTotalPages(totalItems, itemsPerPage);
  const validPage = validatePageNumber(currentPage, totalPages);
  const paginatedData = getPaginatedData(sortedData, validPage, itemsPerPage);
  
  return {
    data: paginatedData,
    totalItems,
    totalPages,
    currentPage: validPage,
    paginationInfo: getPaginationInfo(validPage, totalPages, itemsPerPage, totalItems),
  };
};
