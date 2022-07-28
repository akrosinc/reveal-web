import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../api/providers';
import Paginator from '../../../components/Pagination';
import DefaultTable from '../../../components/Table/DefaultTable';
import { PAGINATION_DEFAULT_SIZE } from '../../../constants';
import { getAllTags } from '../api';
import { Tag } from '../providers/types';
import CreateTag from './createModal';

const Tagging = () => {
  const [tagList, setTagList] = useState<PageableModel<Tag>>();
  const [showCreate, setShowCreate] = useState(false);

  const loadData = useCallback((size: number, page: number, field?: string, direction?: boolean) => {
    getAllTags(size, page, field, direction)
      .then(res => {
        res.content.forEach(el => {
          el.lookupEntityType = el.lookupEntityType.code as any;
        });
        setTagList(res);
      })
      .catch(err => toast.error(err));
  }, []);

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  const paginationHandler = (size: number, page: number) => {
    loadData(size, page);
  };

  const sortHandler = (field: string, direction: boolean) => {
    loadData(PAGINATION_DEFAULT_SIZE, 0, field, direction);
  };

  return (
    <>
      <div className="d-flex justify-content-between">
        <h2>Tags({tagList?.totalElements})</h2>
        <Button onClick={() => setShowCreate(true)}>Create Tag</Button>
      </div>
      <hr />
      {tagList && tagList.content.length && (
        <>
          <DefaultTable
            sortHandler={sortHandler}
            columns={Object.keys(tagList.content[0]).map(el => {
              return {
                name: el.charAt(0).toUpperCase() + el.slice(1),
                accessor: el,
                sortValue: el
              };
            })}
            data={tagList?.content}
          />
          <Paginator
            page={tagList.pageable.pageNumber}
            size={tagList.size}
            totalElements={tagList.totalElements}
            totalPages={tagList.totalPages}
            paginationHandler={paginationHandler}
          />
        </>
      )}
      {showCreate && (
        <CreateTag
          closeHandler={() => {
            loadData(PAGINATION_DEFAULT_SIZE, 0);
            setShowCreate(false);
          }}
        />
      )}
    </>
  );
};

export default Tagging;
