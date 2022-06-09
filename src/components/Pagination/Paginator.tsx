import React from 'react';
import { Form, Pagination } from 'react-bootstrap';
import { useAppSelector } from '../../store/hooks';

interface Props {
  totalElements: number;
  size: number;
  page: number;
  totalPages: number;
  paginationHandler: (size: number, page: number) => void;
}

const Paginator = ({ totalElements, totalPages, size, page, paginationHandler }: Props) => {
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  let items = [];
  for (let number = 0; number <= totalPages - 1; number++) {
    if (number === page || number === page - 1 || number === page + 1) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === page}
          onClick={() => (number !== page ? paginationHandler(size, number) : null)}
        >
          {number + 1}
        </Pagination.Item>
      );
    }
  }

  return (
    <div className="d-flex justify-content-end align-items-end">
      <Pagination className={isDarkMode ? 'pagination-dark mt-3 mb-0' : 'mt-3 mb-0'}>
        <Pagination.First disabled={page === 0} onClick={() => paginationHandler(size, 0)} />
        <Pagination.Prev disabled={page === 0} onClick={() => paginationHandler(size, page - 1)} />
        {items}
        <Pagination.Next disabled={page === totalPages - 1} onClick={() => paginationHandler(size, page + 1)} />
        <Pagination.Last disabled={page === totalPages - 1} onClick={() => paginationHandler(size, totalPages - 1)} />
      </Pagination>
      <Form.Select
        className={isDarkMode ? 'ms-2 text-light bg-dark border-0' : "ms-2"}
        style={{ width: '70px' }}
        value={size}
        onChange={e => paginationHandler(Number(e.target.value), page)}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </Form.Select>
    </div>
  );
};

export default Paginator;
