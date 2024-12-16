import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getPlanList } from '../plan/api';
import { toast } from 'react-toastify';
import { PAGINATION_DEFAULT_SIZE } from '../../constants';
import { PageableModel } from '../../api/providers';
import { PlanModel } from '../plan/providers/types';
import Select from 'react-select';
import { Button, Col, Container, Form, FormGroup, Row } from 'react-bootstrap';
import { getDataExtract } from './api';

const DataExtract = () => {
  const [planList, setPlanList] = useState<PageableModel<PlanModel>>();
  const [selectedPlan, setSelectedPlan] = useState<string>();
  let link = useRef<HTMLAnchorElement>(null);

  // const paginationHandler = (size: number, page: number) => {
  //   loadData(size, page);
  // };
  //
  // const sortHandler = (sortValue: string, direction: boolean) => {
  //   setCurrentSortDirection(direction);
  //   setCurrentSortField(sortValue);
  // };

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
    if (planModel) {
      getDataExtract(planModel.identifier)
        .then(res => {
          if (link && link.current) {
            link.current.href = window.URL.createObjectURL(new Blob([res], { type: 'text/csv;charset=utf-8' }));
            link.current.download = 'data-extract.csv';
            link.current.click();
          }
        })
        .catch(ex => toast.error(ex));
    }
  }, [selectedPlan, planList]);

  return (
    <Container fluid className="text-center my-4">
      <Row className="justify-content-start">
        <Col md={2}>
          <FormGroup style={{ display: 'flex', alignItems: 'center' }}>
            <Form.Label style={{ marginRight: '10px' }}>Select Plan</Form.Label>
            <Select
              options={planList?.content.map(plan => new Option(plan.name, plan.identifier))}
              onChange={e => setSelectedPlan(e?.value)}
            />
          </FormGroup>
        </Col>
        <Col md={1}>{selectedPlan ? <Button onClick={() => getCSV()}>Get CSV</Button> : null}</Col>
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
