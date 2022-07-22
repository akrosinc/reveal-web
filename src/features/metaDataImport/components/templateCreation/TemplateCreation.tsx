import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../../api/providers';
import { getLocationHierarchyList } from '../../../location/api';
import { LocationHierarchyModel } from '../../../location/providers/types';
import Select from 'react-select';
import { downloadLocations, getEntityTagList } from '../../api';
import { getEntityTags } from '../../../planSimulation/api';
import { EntityTag } from '../../../planSimulation/providers/types';

export const TemplateCreation = () => {
  const [hierarchyList, setHierarchyList] = useState<PageableModel<LocationHierarchyModel>>();
  const [selectedHierarchy, setSelectedHierarchy] = useState<string>();
  const [nodeList, setNodeList] = useState<string[]>([]);
  const [selectedGegraphichLevel, setSelectedGegraphichLevel] = useState<string>();
  const [entityTagList, setEntityTagList] = useState<EntityTag[]>();
  const [selectedEntityTags, setSelectedEntityTags] = useState<string[]>([]);

  useEffect(() => {
    getLocationHierarchyList(50, 0, true).then(res => setHierarchyList(res));
    getEntityTagList().then(res => {
      const location = res.content.find(el => el.lookupEntityType.code === 'Location');
      if (location) {
        getEntityTags(location.lookupEntityType.identifier).then(res => setEntityTagList(res));
      }
    });
  }, []);

  const { t } = useTranslation();

  return (
    <>
      <Row className="align-items-center mt-4">
        <Col md={2}>
          <Form.Label className="text-center">{t('simulationPage.hierarchy')}:</Form.Label>
        </Col>
        <Col md={6}>
          <Select
            placeholder="Select Hierarchy"
            options={hierarchyList?.content.map<{ value: string; label: string }>(el => {
              return {
                label: el.name,
                value: el.identifier ?? ''
              };
            })}
            onChange={e => {
              const selectedHierarchy = hierarchyList?.content.find(el => el.identifier === e?.value);
              if (selectedHierarchy) {
                setSelectedHierarchy(e?.value);
                setNodeList(selectedHierarchy.nodeOrder);
              } else {
                setSelectedHierarchy(undefined);
                setNodeList([]);
              }
            }}
          />
        </Col>
      </Row>
      <Row className="mt-4 align-items-center">
        <Col md={2}>
          <Form.Label className="text-center">{t('simulationPage.geographicLevel')}:</Form.Label>
        </Col>
        <Col md={6}>
          <Select
            options={nodeList.map<{ value: string; label: string }>(el => {
              return {
                label: el,
                value: el
              };
            })}
            onChange={e => {
              setSelectedGegraphichLevel(e?.value ?? undefined);
            }}
          />
        </Col>
      </Row>
      <Row className="mt-4 align-items-center">
        <Col md={2}>
          <Form.Label className="text-center">Entity tags:</Form.Label>
        </Col>
        <Col md={6}>
          <Select
            isMulti
            options={entityTagList?.map<{ label: string; value: string }>(el => {
              return {
                label: el.tag,
                value: el.identifier
              };
            })}
            onChange={e => {
              setSelectedEntityTags(e.map(el => el.value));
            }}
          />
        </Col>
      </Row>
      <Row className="mt-4 align-items-center">
        <Col md={2}>
          <Form.Label className="text-center">File Template:</Form.Label>
        </Col>
        <Col md={6}>
          <Button
            onClick={() => {
              if (selectedHierarchy && selectedGegraphichLevel && selectedEntityTags.length) {
                toast.info('Download template starting now...');
                downloadLocations(selectedHierarchy, selectedGegraphichLevel, selectedEntityTags)
                  .then(res => {
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(new Blob([res], { type: 'application/vnd.ms-excel' }));
                    link.setAttribute('download', `LocationMeta_${+new Date()}.xlsx`);
                    link.click();
                    link.remove();
                  })
                  .catch(err => {
                    toast.error(err);
                  });
              } else {
                toast.error('Please select all the fields');
              }
            }}
          >
            Download
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default TemplateCreation;
