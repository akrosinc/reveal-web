import React from "react";
import { Pagination } from "react-bootstrap";

interface Props {
  totalElements: number;
  size: number;
  page: number;
  totalPages: number;
  paginationHandler: (size: number, page: number) => void;
}

const Paginator = ({ totalElements, totalPages, size, page, paginationHandler }: Props) => {
  let items = [];
  for (let number = 0; number <= totalPages - 1; number++) {
    items.push(
      <Pagination.Item key={number} active={number === page} onClick={() => paginationHandler(size, number)}>
        {number + 1}
      </Pagination.Item>
    );
  }

  return (
    <div className="d-flex justify-content-end">
      <Pagination>
        <Pagination.First disabled={page === 0} onClick={() => paginationHandler(size, 0)} />
        <Pagination.Prev disabled={page === 0} onClick={() => paginationHandler(size, page - 1)} />
        {items}
        <Pagination.Next disabled={page === totalPages - 1} onClick={() => paginationHandler(size, page + 1)} />
        <Pagination.Last disabled={page === totalPages - 1} onClick={() => paginationHandler(size, totalPages - 1)} />
      </Pagination>
    </div>
  );
};

export default Paginator;
