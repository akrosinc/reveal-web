import React from "react";
import { Form, Pagination } from "react-bootstrap";

interface Props {
  totalElements: number;
  size: number;
  page: number;
  totalPages: number;
  paginationHandler: (size: number, page: number) => void;
}

const Paginator = ({
  totalElements,
  totalPages,
  size,
  page,
  paginationHandler,
}: Props) => {
  let items = [];
  for (let number = 0; number <= totalPages - 1; number++) {
    if (number === page || number === page - 1 || number === page + 1) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === page}
          onClick={() =>
            number !== page ? paginationHandler(size, number) : null
          }
        >
          {number + 1}
        </Pagination.Item>
      );
    }
  }

  return (
    <div className="d-flex justify-content-end align-items-center">
      <Pagination className="mt-3">
        <Pagination.First
          disabled={page === 0}
          onClick={() => paginationHandler(size, 0)}
        />
        <Pagination.Prev
          disabled={page === 0}
          onClick={() => paginationHandler(size, page - 1)}
        />
        {items}
        <Pagination.Next
          disabled={page === totalPages - 1}
          onClick={() => paginationHandler(size, page + 1)}
        />
        <Pagination.Last
          disabled={page === totalPages - 1}
          onClick={() => paginationHandler(size, totalPages - 1)}
        />
      </Pagination>
      <Form.Select className="ms-2" style={{width: '70px'}} value={size} onChange={(e) => paginationHandler(Number(e.target.value), page)}>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </Form.Select>
    </div>
  );
};

export default Paginator;
