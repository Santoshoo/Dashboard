import { useState, useCallback } from 'react';
import {
  calculateTotalPages,
  getPaginatedData,
  validatePageNumber,
  getPaginationInfo,
} from './pagination';

/**
 * Custom hook for pagination
 * @param {Array} data - Array of items to paginate
 * @param {number} itemsPerPage - Items per page (default: 10)
 * @returns {Object} Pagination state and methods
 */
export const usePagination = (data = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = data.length;
  const totalPages = calculateTotalPages(totalItems, itemsPerPage);
  const validPage = validatePageNumber(currentPage, totalPages);
  const paginatedData = getPaginatedData(data, validPage, itemsPerPage);
  const paginationInfo = getPaginationInfo(validPage, totalPages, itemsPerPage, totalItems);

  // Go to specific page
  const goToPage = useCallback(
    (page) => {
      const validatedPage = validatePageNumber(page, totalPages);
      setCurrentPage(validatedPage);
    },
    [totalPages]
  );

  // Go to next page
  const nextPage = useCallback(() => {
    setCurrentPage((prev) => {
      const next = prev + 1;
      return next > totalPages ? totalPages : next;
    });
  }, [totalPages]);

  // Go to previous page
  const previousPage = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 < 1 ? 1 : prev - 1));
  }, []);

  // Go to first page
  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Go to last page
  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages || 1);
  }, [totalPages]);

  // Reset pagination when data changes significantly
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage: validPage,
    totalPages,
    totalItems,
    paginatedData,
    paginationInfo,
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    resetPagination,
    hasNextPage: paginationInfo.hasNextPage,
    hasPreviousPage: paginationInfo.hasPreviousPage,
  };
};

export default usePagination;
