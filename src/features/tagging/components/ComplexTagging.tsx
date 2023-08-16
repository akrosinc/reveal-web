import React, { useEffect, useState } from 'react';
import { getGeneratedLocationHierarchyList, getLocationHierarchyList } from '../../location/api';
import { getComplexTagReponses, getEntityList } from '../../planSimulation/api';
import { HierarchyType } from '../../planSimulation/providers/types';
import { toast } from 'react-toastify';
import { LocationHierarchyModel } from '../../location/providers/types';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { DebounceInput } from 'react-debounce-input';
import MetadataFormulaPanel, {
  TagWithFormulaSymbol
} from '../../planSimulation/components/MetadataFormula/MetadataFormulaPanel';
import ComplexTagTable from '../../../components/Table/ComplexTagTable';

export interface ComplexTagResponse {
  id: string;
  hierarchyId: string;
  hierarchyType: string;
  tagName: string;
  tags: TagWithFormulaSymbol[];
  formula: string;
}

export interface ComplexTagRequest {
  hierarchyId: string;
  hierarchyType: string;
  tagName: string;
  tags: TagWithFormulaSymbol[];
  formula: string;
}

const ComplexTagging = () => {
  const [combinedHierarchyList, setCombinedHierarchyList] = useState<LocationHierarchyModel[]>();
  const { t } = useTranslation();
  const [showCreateComplexTagPanel, setShowCreateComplexTagPanel] = useState(false);
  const [complexTags, setComplexTags] = useState<ComplexTagResponse[]>();
  const [selectedComplexTag, setSelectedComplexTag] = useState<ComplexTagResponse>();
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
            <Button className="float-end" onClick={() => setShowCreateComplexTagPanel(true)}>
              {t('buttons.create')}
            </Button>
          </Col>
        </Row>
      </h2>

      <hr className="mb-4" />
      <ComplexTagTable
        columns={[
          { name: 'complexTagName', accessor: 'tagName', sortValue: 'tagName', key: 'tagName' },
          { name: 'complexTagFormula', accessor: 'formula', sortValue: 'formula', key: 'formula' },
          { name: 'complexTagVariables', accessor: 'tags', sortValue: 'tags', key: 'tags' }
        ]}
        data={complexTags}
        clickHandler={dataEl => {
          setSelectedComplexTag(dataEl);
          setShowCreateComplexTagPanel(true);
        }}
      />
      {showCreateComplexTagPanel && (
        <MetadataFormulaPanel
          showModal={showCreateComplexTagPanel}
          closeHandler={() => {
            setShowCreateComplexTagPanel(false);
            setSelectedComplexTag(undefined);
          }}
          combinedHierarchyList={combinedHierarchyList}
          currentTag={selectedComplexTag}
        />
      )}
    </>
  );
};
export default ComplexTagging;
