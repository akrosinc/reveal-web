import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../../api/providers';
import { getLocationHierarchyList } from '../../../location/api';
import { LocationHierarchyModel } from '../../../location/providers/types';
import Select from 'react-select';
import { downloadAmdrImportTemplate, getAmdrKeys} from '../../api';

export const AmdrTemplateCreation = () => {
  const [hierarchyList, setHierarchyList] = useState<PageableModel<LocationHierarchyModel>>();
  const [selectedHierarchy, setSelectedHierarchy] = useState<string>();
  const [nodeList, setNodeList] = useState<string[]>([]);
  const [selectedGegraphichLevel, setSelectedGegraphichLevel] = useState<string>();
  const [amdrKeys, setAmdrKeys] = useState<string[]>();
  const [selectedAmdrKey, setSelectedAmdrKey] = useState<string>();

  useEffect(() => {
    getLocationHierarchyList(50, 0, true).then(res => setHierarchyList(res));
    getAmdrKeys().then(res=>setAmdrKeys(res))
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
            placeholder={t('simulationPage.selectHierarchy') + '...'}
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
          <Form.Label className="text-center">{t('amdrImport.lowestGeographicLevel')}:</Form.Label>
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
          <Form.Label className="text-center">{t('amdrImport.haplotype')}:</Form.Label>
        </Col>
        <Col md={6}>
          <Select
              options={amdrKeys?.map<{ label: string; value: string }>(el => {
                return {
                  label: el,
                  value: el
                };
              })}
              onChange={e => {
                setSelectedAmdrKey(e?.value);
              }}
          />
        </Col>
      </Row>
      <Row className="mt-4 align-items-center">
        <Col md={2}>
          <Form.Label className="text-center">{t('simulationPage.fileTemplate')}:</Form.Label>
        </Col>
        <Col md={6}>
          <Button
            onClick={() => {
              if (selectedHierarchy && selectedGegraphichLevel && selectedAmdrKey) {
                toast.info('Download template starting now...');
                downloadAmdrImportTemplate(selectedHierarchy, selectedGegraphichLevel, selectedAmdrKey)
                  .then(res => {
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(new Blob([res], { type: 'application/vnd.ms-excel' }));

                    let todayDateMs = Date.now();
                    let todayDate = new Date();

                    let dateString = new Date(todayDateMs - todayDate.getTimezoneOffset() * 60000)
                      .toISOString()
                      .replaceAll(':', '_')
                      .replace('Z', '');

                    link.setAttribute('download', `AmdrLocation_${dateString}.xlsx`);
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
            {t('amdrImport.download')}
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default AmdrTemplateCreation;
