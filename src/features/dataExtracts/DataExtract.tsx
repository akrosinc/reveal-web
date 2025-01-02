import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getPlanList } from '../plan/api';
import { toast } from 'react-toastify';
import { PAGINATION_DEFAULT_SIZE } from '../../constants';
import { PageableModel } from '../../api/providers';
import { PlanModel } from '../plan/providers/types';
import Select from 'react-select';
import { Button, Col, Container, Form, FormGroup, Row } from 'react-bootstrap';
import { getDataExtract, getQueryLabels } from './api';

import { DataExtractQueryResponse } from './providers/types';

const DataExtract = () => {
  const [planList, setPlanList] = useState<PageableModel<PlanModel>>();
  const [selectedPlan, setSelectedPlan] = useState<string>();
  const [dataExtractLabels, setDataExtractLabels] = useState<DataExtractQueryResponse[]>();
  const [selectedDataExtractLabelId, setSelectedDataExtractLabelId] = useState<string>();
  let link = useRef<HTMLAnchorElement>(null);

  const loadData = useCallback((size: number, page: number) => {
    getPlanList(size, page, true, '', '', false)
      .then(res => setPlanList(res))
      .catch(err => toast.error(err));
  }, []);

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  const getCSV = useCallback(() => {
    const planModel = planList?.content.find(plan => plan.identifier === selectedPlan);
    if (planModel && selectedDataExtractLabelId) {
      getDataExtract(planModel.identifier, selectedDataExtractLabelId)
        .then(res => {
          if (link && link.current) {
            link.current.href = window.URL.createObjectURL(new Blob([res], { type: 'text/csv;charset=utf-8' }));
            link.current.download = 'data-extract.csv';
            link.current.click();
          }
        })

        .catch(ex => toast.error(ex));
    }
  }, [selectedPlan, planList, selectedDataExtractLabelId]);

  return (
    <Container fluid className="text-center my-4">
      <Row className="justify-content-start">
        <Col md={2}>
          <FormGroup style={{ display: 'flex', alignItems: 'center' }}>
            <Form.Label style={{ marginRight: '10px' }}>Select Plan</Form.Label>
            <Select
              styles={{
                container: provided => ({
                  ...provided,
                  width: 800 // Control the width here
                })
              }}
              options={planList?.content.map(plan => new Option(plan.name, plan.identifier))}
              onChange={e => {
                setSelectedPlan(e?.value);
                if (e?.value != null) {
                  getQueryLabels(e?.value).then(labels => setDataExtractLabels(labels));
                }
              }}
            />
          </FormGroup>
        </Col>
        <Col md={2}>
          {selectedPlan ? (
            <FormGroup style={{ display: 'flex', alignItems: 'center' }}>
              <Form.Label style={{ marginRight: '10px' }}>Select Extract</Form.Label>
              <Select
                styles={{
                  container: provided => ({
                    ...provided,
                    width: 300 // Control the width here
                  })
                }}
                options={dataExtractLabels?.map(
                  dataExtractLabel => new Option(dataExtractLabel.queryLabel, dataExtractLabel.queryLabel)
                )}
                onChange={e => setSelectedDataExtractLabelId(e?.value)}
              />
            </FormGroup>
          ) : null}
        </Col>
        <Col md={1}>
          {selectedPlan && selectedDataExtractLabelId ? <Button onClick={() => getCSV()}>Get CSV</Button> : null}
        </Col>
      </Row>
      <a
        style={{ display: 'none' }}
        target={'_blank'}
        ref={link}
        href={'data:text/csv;charset=utf-8,'}
        download={'emptyfile.csv'}
        rel="noreferrer"
      >
        hidden
      </a>
    </Container>
  );
};
export default DataExtract;
