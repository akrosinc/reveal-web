import { Col, Container, Form, FormGroup, Row } from 'react-bootstrap';
import Select from 'react-select';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getPlanList } from '../plan/api';
import { toast } from 'react-toastify';
import { PageableModel } from '../../api/providers';
import { PlanModel } from '../plan/providers/types';
import { PAGINATION_DEFAULT_SIZE } from '../../constants';

const DataExtractQuery = () => {
  const [planList, setPlanList] = useState<PageableModel<PlanModel>>();
  const [selectedPlan, setSelectedPlan] = useState<string>();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [sqlCode] = useState<string>('SELECT * FROM users;\nWHERE age > 25;\nORDER BY name;');

  const loadData = useCallback((size: number, page: number) => {
    getPlanList(size, page, true, '', '', false)
      .then(res => setPlanList(res))
      .catch(err => toast.error(err));
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset the height to auto to shrink if necessary
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set the height to the scroll height
    }
  };

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  useEffect(() => {
    adjustHeight();
  }, [sqlCode]);

  // useEffect(() => {
  //   const planModel = planList?.content.find(plan => plan.identifier === selectedPlan);
  // }, [selectedPlan]);

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
        <Col md={2}>
          <Form.Group controlId="exampleForm.ControlTextarea1">
            <Form.Label>SQL Code</Form.Label>
            <Form.Control
              ref={textareaRef} // Reference to the textarea
              as="textarea"
              rows={1} // Start with 1 row, it will expand based on content
              value={sqlCode}
              readOnly
              style={{ resize: 'none', overflow: 'hidden' }} // Disable manual resizing and hide scrollbars
              placeholder="Your SQL query will appear here..."
            />
            <input type={'hidden'} value={selectedPlan} />
          </Form.Group>
        </Col>
      </Row>
    </Container>
  );
};

export default DataExtractQuery;
