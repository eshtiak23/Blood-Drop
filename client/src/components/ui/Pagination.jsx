/**
 * Pagination — Reusable pagination component.
 * Shows max 5 page buttons with smart windowing + Prev/Next.
 *
 * Props:
 *   page          — current page (1-indexed)
 *   totalPages    — total number of pages
 *   onPageChange  — callback(pageNumber) when page is clicked
 */
import { ChevronLeft, ChevronRight } from "lucide-react";

const MAX_VISIBLE = 5;

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    let start = 1;
    let end = totalPages;

    if (totalPages > MAX_VISIBLE) {
      if (page <= 3) {
        start = 1;
        end = MAX_VISIBLE;
      } else if (page >= totalPages - 2) {
        start = totalPages - MAX_VISIBLE + 1;
        end = totalPages;
      } else {
        start = page - 2;
        end = page + 2;
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          className={`page-btn ${page === p ? "active" : ""}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        className="page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
