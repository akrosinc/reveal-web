import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import { DebounceInput } from 'react-debounce-input';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../api/providers';
import Paginator from '../../../components/Pagination';
import EntityTagTable from '../../../components/Table/EntityTagTable';
import { PAGINATION_DEFAULT_SIZE, REVEAL_SIMULATION_EDIT } from '../../../constants';
import { getAllGlobalTags, updateTag } from '../api';
import { Tag, TagUpdateRequest } from '../providers/types';
import CreateTag from './createModal';
import AuthorizedElement from '../../../components/AuthorizedElement';
import TagAccess from '../../access/TagAccess';

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
  const [showTagAccess, setShowTagAccess] = useState(false);

  const loadData = useCallback((size: number, page: number, filter?: string, field?: string, direction?: boolean) => {
    getAllGlobalTags(size, page, filter, field, direction)
      .then(res => {
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

  const updateSimulationDisplay = (tag: TagUpdateRequest) => {
    updateTag(tag).then(() => loadData(PAGINATION_DEFAULT_SIZE, 0));
  };

  const getColumns = (tagList: PageableModel<Tag>) => {
    const columns = Object.keys(tagList.content[0])
      .filter(el => !columnsNotForDisplay.includes(el))
      .map(el => {
        return {
          name: el,
          accessor: el,
          sortValue: el
        };
      });
    return columns;
  };

  return (
    <>
      <h2>
        Tags({tagList?.totalElements})
        <Row className="my-4">
          <Col md={8} className="mb-2">
            <AuthorizedElement roles={[REVEAL_SIMULATION_EDIT]}>
              <Button className="float-end" onClick={() => setShowCreate(true)}>
                Create Tag
              </Button>
            </AuthorizedElement>
          </Col>
          <Col sm={12} md={4} className="order-md-first">
            <DebounceInput
              id="search-tags"
              className="form-control"
              placeholder="Search Tags"
              debounceTimeout={800}
              onChange={e => filterData(e)}
              disabled={tagList?.totalElements === 0 && currentSearchInput === ''}
            />
          </Col>
        </Row>
      </h2>
      <hr />
      {tagList && tagList.content.length > 0 ? (
        <>
          <EntityTagTable
            sortHandler={sortHandler}
            columns={getColumns(tagList)}
            data={tagList?.content}
            updateTag={updateSimulationDisplay}
            showAccessPanelHandler={setShowTagAccess}
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
      {showTagAccess && (
        <Modal show={showTagAccess} centered size={'lg'} onHide={() => setShowTagAccess(false)}>
          <Modal.Header closeButton>Tag Access</Modal.Header>
          <Modal.Body>
            <TagAccess />
          </Modal.Body>
          <Modal.Footer>
            <Button id="close-button" variant="secondary" onClick={() => setShowTagAccess(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};
export default Tagging;
