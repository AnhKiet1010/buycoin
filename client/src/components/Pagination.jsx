import React from "react";

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const getPages = () => {
    const pages = [];

    if (totalPages <= 10) {
      // Hiển thị tất cả các trang nếu tổng số trang <= 10
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    // Hiển thị các trang dựa trên trang hiện tại
    pages.push(1); // Trang đầu
    if (currentPage > 3) pages.push("..."); // Dấu ...

    // Hai trang gần nhất
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("..."); // Dấu ...
    pages.push(totalPages); // Trang cuối

    return pages;
  };

  const pages = getPages();

  return (
    <nav className="mx-auto my-10">
      <ul className="inline-flex -space-x-px text-sm">
        {/* Nút Previous */}
        <li>
          <button
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={`flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg ${
              currentPage === 1
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-100 hover:text-gray-700"
            }`}
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>

        {/* Hiển thị danh sách trang */}
        {pages.map((page, index) => (
          <li key={index}>
            {page === "..." ? (
              <span className="flex items-center justify-center h-8 px-3 leading-tight text-gray-500 bg-white border border-gray-300">
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${
                  currentPage === page
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                    : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Nút Next */}
        <li>
          <button
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg ${
              currentPage === totalPages
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-100 hover:text-gray-700"
            }`}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
