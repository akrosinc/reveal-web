import React, { useEffect } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getLocationHierarchyList } from '../../../location/api';
import { downloadAmdrImportTemplate, getAmdrKeys} from '../../api';

export const AmdrTemplateCreation = () => {



  const { t } = useTranslation();

  return (
    <>
      <Row className="mt-4 align-items-center">
        <Col md={2}>
          <Form.Label className="text-center">{t('simulationPage.amdrFileTemplate')}:</Form.Label>
        </Col>
        <Col md={6}>
          <Button
            onClick={() => {

                toast.info('Download template starting now...');
                downloadAmdrImportTemplate()
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
