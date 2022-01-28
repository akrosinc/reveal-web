import React, { useState, useEffect } from 'react';
import { Button, Table, Row, Col } from 'react-bootstrap';
import { DebounceInput } from 'react-debounce-input';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../../api/providers';
import Paginator from '../../../../components/Pagination';
import { PAGINATION_DEFAULT_SIZE, PLAN_TABLE_COLUMNS } from '../../../../constants';
import { getPlanList } from '../../api';
import { PlanModel } from '../../providers/types';
import CreatePlan from './create';

const Plans = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [planList, setPlanList] = useState<PageableModel<PlanModel>>();

  useEffect(() => {
    getPlanList(PAGINATION_DEFAULT_SIZE, 0, false).then(res => {
      setPlanList(res);
    });
  }, []);

  const paginationHandler = () => {};

  const filterData = (e: any) => {
    setCurrentSearchInput(e.target.value);
    getPlanList(PAGINATION_DEFAULT_SIZE, 0, false, e.target.value).then(res => {
      setPlanList(res);
    });
  }

  return (
    <>
      <h2>
        Plans ({planList?.totalElements ?? 0})
        <Row className="my-4">
        <Col md={8} className="mb-2">
          <Button className="btn btn-primary float-end" onClick={() => setShowCreate(true)}>
            Create
          </Button>
        </Col>
        <Col sm={12} md={4} className="order-md-first">
          <DebounceInput
            className="form-control"
            placeholder='Search (minimum 3 charaters)'
            debounceTimeout={800}
            onChange={e => filterData(e)}
            disabled={planList?.totalElements === 0 && currentSearchInput === ''}
          />
        </Col>
      </Row>
      </h2>
      <hr className="mb-4" />
      {planList !== undefined && planList.content.length > 0 ? (
        <>
          <Table bordered responsive hover>
            <thead className="border border-2">
              <tr>
                {PLAN_TABLE_COLUMNS.map(el => (
                  <th key={el.name}>{el.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {planList.content.map(el => (
                <tr key={el.identifier} onClick={() => setShowCreate(true)}>
                  <td>{el.title}</td>
                  <td>{el.status}</td>
                  <td>{el.interventionType.name}</td>
                  <td>{el.locationHierarchy.name}</td>
                  <td>{el.effectivePeriod.start}</td>
                  <td>{el.effectivePeriod.end}</td>
                  <td className="text-center">
                    <Button onClick={(e: React.MouseEvent<HTMLElement>) => {
                      e.stopPropagation();
                      toast.success(`Plan with identifier: ${el.identifier} activated successfully!`)
                    }} disabled={el.status !== 'DRAFT'}>{el.status === 'DRAFT' ? 'Activate' : 'Active'}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginator
            page={planList.pageable.pageNumber}
            paginationHandler={paginationHandler}
            size={planList.size}
            totalElements={planList.totalElements}
            totalPages={planList.totalPages}
          />
        </>
      ) : (
        <p className="text-center lead">No plans found.</p>
      )}
      <CreatePlan show={showCreate} handleClose={() => setShowCreate(false)} />
    </>
  );
};

export default Plans;
