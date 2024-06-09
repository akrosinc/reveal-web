import React, { useEffect, useState } from 'react';
import { getGeneratedLocationHierarchyList, getLocationHierarchyList } from '../../location/api';
import { deleteComplexTag, getComplexTagReponses, getEntityList } from '../../planSimulation/api';
import { ComplexTagResponse, HierarchyType } from '../../planSimulation/providers/types';
import { toast } from 'react-toastify';
import { LocationHierarchyModel } from '../../location/providers/types';
import { Button, Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { DebounceInput } from 'react-debounce-input';
import MetadataFormulaPanel, {
  TagWithFormulaSymbol
} from '../../planSimulation/components/MetadataFormula/MetadataFormulaPanel';
import ComplexTagTable from '../../../components/Table/ComplexTagTable';
import { REVEAL_SIMULATION_EDIT } from '../../../constants';
import AuthorizedElement from '../../../components/AuthorizedElement';
import TagAccess from '../../access/TagAccess';
import MetadataFormulaPanelViewOnly from '../../planSimulation/components/MetadataFormula/MetadataFormulaPanelViewOnly';
import DeleteTag from './DeleteTag';
import RemoveTagAccess from '../../access/RemoveTagAccess';

export interface ComplexTagRequest {
  hierarchyId: string;
  hierarchyType: string;
  tagName: string;
  tags: TagWithFormulaSymbol[];
  formula: string;
}

export interface TagToDelete {
  id: string;
  type: string;
  tag: string;
  children?: TagToDelete[];
}
const ComplexTagging = () => {
  const [combinedHierarchyList, setCombinedHierarchyList] = useState<LocationHierarchyModel[]>();
  const { t } = useTranslation();
  const [showCreateComplexTagPanel, setShowCreateComplexTagPanel] = useState(false);
  const [showViewComplexTagPanel, setViewCreateComplexTagPanel] = useState(false);
  const [complexTags, setComplexTags] = useState<ComplexTagResponse[]>();
  const [selectedComplexTag, setSelectedComplexTag] = useState<ComplexTagResponse>();
  const [showTagAccess, setShowTagAccess] = useState(false);
  const [showDeleteTagPanel, setShowDeleteTagPanel] = useState(false);
  const [selectedTagToDelete, setSelectedTagToDelete] = useState<TagToDelete>();
  const [selectedMetadata, setSelectedMetadata] = useState<ComplexTagResponse[]>([]);
  const [showRemoveAccess, setShowRemoveAccess] = useState(false);

  useEffect(() => {
    Promise.all([getLocationHierarchyList(50, 0, true), getEntityList(), getGeneratedLocationHierarchyList()])
      .then(([locationHierarchyList, entityList, generatedHierarchyList]) => {
        let generatedHierarchyItems = generatedHierarchyList?.map(generatedHierarchy => {
          return {
            identifier: generatedHierarchy.identifier,
            name: generatedHierarchy.name,
            nodeOrder: generatedHierarchy.nodeOrder,
            type: HierarchyType.GENERATED
          };
        });

        let list = locationHierarchyList?.content.map(savedHierarchy => {
          return {
            identifier: savedHierarchy.identifier,
            name: savedHierarchy.name,
            nodeOrder: savedHierarchy.nodeOrder,
            type: HierarchyType.SAVED
          };
        });

        let combinedList = list.concat(generatedHierarchyItems);
        setCombinedHierarchyList(combinedList);
      })
      .catch(err => toast.error(err));

    getComplexTagReponses().then(data => setComplexTags(data));
  }, []);

  const setShowTagAccessWithSelectedTag = (tag: ComplexTagResponse) => {
    setShowTagAccess(true);

    const complexTag = new ComplexTagResponse(
      tag.id,
      tag.hierarchyId,
      tag.hierarchyType,
      tag.tagName,
      tag.tags,
      tag.formula,
      tag.owner,
      tag.owners,
      tag.calculateValue,
      tag.public,
      tag.tagAccGrantsOrganization,
      tag.tagAccGrantsUser,
      tag.selected,
      tag.resultingOrgs,
      tag.resultingUsers
    );
    setSelectedMetadata([complexTag]);
  };

  const setShowRemoveAccessWithSelectedTag = (tag: ComplexTagResponse) => {
    setShowRemoveAccess(true);

    const complexTag = new ComplexTagResponse(
      tag.id,
      tag.hierarchyId,
      tag.hierarchyType,
      tag.tagName,
      tag.tags,
      tag.formula,
      tag.owner,
      tag.owners,
      tag.calculateValue,
      tag.public,
      tag.tagAccGrantsOrganization,
      tag.tagAccGrantsUser,
      tag.selected,
      tag.resultingOrgs,
      tag.resultingUsers
    );
    setSelectedMetadata([complexTag]);
  };

  const setTagGrantsUpdated = () => {
    setShowTagAccess(false);
    setShowRemoveAccess(false);
    getComplexTagReponses().then(data => setComplexTags(data));
  };

  const proceedToDeleteComplexTag = (tag?: TagToDelete) => {
    if (tag) {
      deleteComplexTag(tag).then(() => {
        setShowDeleteTagPanel(false);
        getComplexTagReponses().then(data => setComplexTags(data));
      });
    }
  };

  return (
    <>
      <h2>
        Complex Tags({complexTags?.length})
        <Row className="my-4">
          <Col sm={12} md={4}>
            <DebounceInput
              id="search-tags"
              className="form-control"
              placeholder="Search Tags"
              debounceTimeout={800}
              onChange={e => {}}
            />
          </Col>
          <Col className="mb-2" md={8}>
            <AuthorizedElement roles={[REVEAL_SIMULATION_EDIT]}>
              <Button className="float-end" onClick={() => setShowCreateComplexTagPanel(true)}>
                {t('buttons.create')}
              </Button>
            </AuthorizedElement>
          </Col>
        </Row>
      </h2>

      <hr className="mb-4" />
      {complexTags && complexTags?.length > 0 ? (
        <ComplexTagTable
          columns={[
            { name: 'complexTagName', accessor: 'tagName', sortValue: 'tagName', key: 'tagName' },
            { name: 'complexTagFormula', accessor: 'formula', sortValue: 'formula', key: 'formula' },
            { name: 'complexTagVariables', accessor: 'complexTagVariables', sortValue: 'tags', key: 'tags' },
            { name: 'owners', accessor: 'owners', sortValue: 'owners', key: 'owners' },
            { name: 'access', accessor: 'access', sortValue: 'access', key: 'access' },
            { name: 'removeAccess', accessor: 'removeAccess', sortValue: 'removeAccess', key: 'removeAccess' },
            { name: 'delete', accessor: 'delete', sortValue: 'delete', key: 'delete' }
          ]}
          data={complexTags}
          clickHandler={dataEl => {
            setSelectedComplexTag(dataEl);
            setViewCreateComplexTagPanel(true);
          }}
          showAccessPanelHandler={setShowTagAccessWithSelectedTag}
          setShowDeleteTagPanel={setShowDeleteTagPanel}
          setSelectedTagToDelete={setSelectedTagToDelete}
          showRemoveAccessPanelHandler={setShowRemoveAccessWithSelectedTag}
        />
      ) : (
        <p>No data found.</p>
      )}
      {showCreateComplexTagPanel && (
        <MetadataFormulaPanel
          showModal={showCreateComplexTagPanel}
          closeHandler={() => {
            setShowCreateComplexTagPanel(false);
            setSelectedComplexTag(undefined);
          }}
          submitHandler={() => {
            getComplexTagReponses().then(data => setComplexTags(data));
          }}
          combinedHierarchyList={combinedHierarchyList}
          currentTag={selectedComplexTag}
        />
      )}
      {showViewComplexTagPanel && (
        <MetadataFormulaPanelViewOnly
          showModal={showViewComplexTagPanel}
          closeHandler={() => {
            setViewCreateComplexTagPanel(false);
            setSelectedComplexTag(undefined);
          }}
          combinedHierarchyList={combinedHierarchyList}
          currentTag={selectedComplexTag}
        />
      )}
      {showTagAccess && (
        <TagAccess
          showTagAccess={showTagAccess}
          setShowTagAccess={setShowTagAccess}
          selectedMetadata={selectedMetadata}
          setTagGrantsUpdated={setTagGrantsUpdated}
          type={'complexTag'}
        />
      )}
      {showRemoveAccess && (
        <RemoveTagAccess
          showRemoveAccess={showRemoveAccess}
          setShowRemoveAccess={setTagGrantsUpdated}
          selectedMetadata={selectedMetadata}
          setTagGrantsUpdated={setTagGrantsUpdated}
          type={'complexTag'}
        />
      )}
      {showDeleteTagPanel && (
        <DeleteTag
          showDeleteTagPanel={showDeleteTagPanel}
          setShowDeleteTagPanel={setShowDeleteTagPanel}
          proceedToDeleteTag={proceedToDeleteComplexTag}
          selectedTagToDelete={selectedTagToDelete}
        />
      )}
    </>
  );
};
export default ComplexTagging;
