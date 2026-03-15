import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
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

import { EntityTagResponse } from '../../planSimulation/providers/types';
import TagAccess from '../../access/TagAccess';
import { TagToDelete } from './ComplexTagging';
import DeleteTag from './DeleteTag';
import { deleteSimpleTags } from '../../planSimulation/api';
import RemoveTagAccess from '../../access/RemoveTagAccess';

const columnsNotForDisplay = [
  'identifier',
  'definition',
  'metadataImportId',
  'referencedTag',
  'tagAccGrantsOrganization',
  'aggregationMethod',
  'tagAccGrantsUser',
  'resultLiteral',
  'resultExpression',
  'generated',
  'addToMetadata',
  'fieldType',
  'referenceFields',
  'generationFormula',
  'owner',
  'children',
  'created',
  'deleting'
];

const Tagging = () => {
  const [tagList, setTagList] = useState<PageableModel<Tag>>();
  const [showCreate, setShowCreate] = useState(false);
  const [currentSortDirection, setCurrentSortDirection] = useState<boolean>();
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [showTagAccess, setShowTagAccess] = useState(false);
  const [showRemoveAccess, setShowRemoveAccess] = useState(false);
  const [selectedMetadata, setSelectedMetadata] = useState<EntityTagResponse[]>([]);
  const [showDeleteTagPanel, setShowDeleteTagPanel] = useState(false);
  const [selectedTagToDelete, setSelectedTagToDelete] = useState<TagToDelete>();
  const [selectedTagsToDelete, setSelectedTagsToDelete] = useState<TagToDelete[]>();

  const loadData = useCallback((size: number, page: number, filter?: string, field?: string, direction?: boolean) => {
    getAllGlobalTags(size, page, filter, field, direction)
      .then(res => {
        let entityTagsNotAggregate: Tag[] | undefined = res.content?.filter(entityTag => !entityTag.aggregate);

        let entityTagWithChildren = entityTagsNotAggregate?.map(entityTag => {
          entityTag.children = res.content?.filter(entityTagEvent => {
            return entityTagEvent.aggregate && entityTagEvent.referencedTag === entityTag.identifier;
          });
          return entityTag;
        });
        res.content = entityTagWithChildren;
        setTagList(res);
      })
      .catch(err => toast.error(err));
  }, []);

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  useEffect(() => {
    if (selectedTagToDelete) {
      let tags = [];
      tags.push(selectedTagToDelete);
      if (selectedTagToDelete.children) {
        tags.push(...selectedTagToDelete.children);
      }
      setSelectedTagsToDelete(tags);
    }
  }, [selectedTagToDelete]);

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
    columns.push({
      name: 'access',
      accessor: 'tag',
      sortValue: 'access'
    });
    columns.push({
      name: 'removeAccess',
      accessor: 'removeAccess',
      sortValue: 'removeAccess'
    });
    columns.push({
      name: 'delete',
      accessor: 'delete',
      sortValue: 'delete'
    });

    return columns;
  };
  const setShowTagAccessWithSelectedTag = (tag: EntityTagResponse) => {
    setShowTagAccess(true);

    console.log('is it here', tag instanceof EntityTagResponse);

    setSelectedMetadata([tag]);
  };

  const setShowRemoveAccessWithSelectedTag = (tag: EntityTagResponse) => {
    setShowRemoveAccess(true);

    setSelectedMetadata([tag]);
  };

  const setTagGrantsUpdated = () => {
    setShowTagAccess(false);
    setShowRemoveAccess(false);
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  };

  const proceedToDeleteSimpleTag = (tags?: TagToDelete[]) => {
    if (tags) {
      deleteSimpleTags(tags).then(() => {
        setShowDeleteTagPanel(false);
        loadData(PAGINATION_DEFAULT_SIZE, 0);
      });
    }
  };

  return (
    <>
      <h2>
        Tags({tagList?.totalElements})
        <Row className="my-4">
          <Col md={8} className="mb-2">
            <AuthorizedElement 
            // roles={[REVEAL_SIMULATION_EDIT]}
            roles={[]}
            >
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
            showAccessPanelHandler={setShowTagAccessWithSelectedTag}
            setShowDeleteTagPanel={setShowDeleteTagPanel}
            setSelectedTagToDelete={setSelectedTagToDelete}
            showRemoveAccessPanelHandler={setShowRemoveAccessWithSelectedTag}
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
        <TagAccess
          showTagAccess={showTagAccess}
          setShowTagAccess={setTagGrantsUpdated}
          selectedMetadata={selectedMetadata}
          setTagGrantsUpdated={setTagGrantsUpdated}
          type={'tag'}
        />
      )}
      {showRemoveAccess && (
        <RemoveTagAccess
          showRemoveAccess={showRemoveAccess}
          setShowRemoveAccess={setTagGrantsUpdated}
          selectedMetadata={selectedMetadata}
          setTagGrantsUpdated={setTagGrantsUpdated}
          type={'tag'}
        />
      )}
      {showDeleteTagPanel && (
        <DeleteTag
          showDeleteTagPanel={showDeleteTagPanel}
          setShowDeleteTagPanel={setShowDeleteTagPanel}
          proceedToDeleteTags={proceedToDeleteSimpleTag}
          selectedTagsToDelete={selectedTagsToDelete}
        />
      )}
    </>
  );
};
export default Tagging;
