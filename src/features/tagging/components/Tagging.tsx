import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { DebounceInput } from 'react-debounce-input';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../api/providers';
import Paginator from '../../../components/Pagination';
import DefaultTable from '../../../components/Table/DefaultTable';
import { PAGINATION_DEFAULT_SIZE } from '../../../constants';
import { getAllGlobalTags } from '../api';
import { Tag } from '../providers/types';
import CreateTag from './createModal';

const columnsNotForDisplay = [
  'valueType',
  'resultLiteral',
  'resultExpression',
  'generated',
  'addToMetadata',
  'fieldType',
  'referenceFields',
  'generationFormula'
];

const Tagging = () => {
  const [tagList, setTagList] = useState<PageableModel<Tag>>();
  const [showCreate, setShowCreate] = useState(false);
  const [currentSortDirection, setCurrentSortDirection] = useState<boolean>();
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSearchInput, setCurrentSearchInput] = useState('');

  const loadData = useCallback((size: number, page: number, filter?: string, field?: string, direction?: boolean) => {
    getAllGlobalTags(size, page, filter, field, direction)
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
    loadData(size, page, currentSearchInput, currentSortField, currentSortDirection);
  };

  const sortHandler = (field: string, direction: boolean) => {
    setCurrentSortDirection(direction);
    setCurrentSortField(field);
    loadData(PAGINATION_DEFAULT_SIZE, 0, currentSearchInput, field, direction);
  };

  const filterData = (e: any) => {
    setCurrentSearchInput(e.target.value);
    loadData(tagList?.size ?? PAGINATION_DEFAULT_SIZE, 0, e.target.value);
  };

  return (
    <>
      
        <h2>Tags({tagList?.totalElements})        
        <Row className="my-4">
          <Col md={8} className="mb-2">
          <Button className='float-end' onClick={() => setShowCreate(true)}>Create Tag</Button>
          </Col>
          <Col sm={12} md={4} className="order-md-first">
            <DebounceInput
              id="search-tags"
              className="form-control"
              placeholder="Search Tags"
              debounceTimeout={800}
              onChange={e => filterData(e)}
              disabled={tagList?.totalElements === 0}
            />
          </Col>
        </Row>
        </h2>
      <hr />
      {tagList && tagList.content.length > 0 ? (
        <>
          <DefaultTable
            sortHandler={sortHandler}
            columns={Object.keys(tagList.content[0])
              .filter(el => !columnsNotForDisplay.includes(el))
              .map(el => {
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
      ) : (
        <p>No data found.</p>
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
