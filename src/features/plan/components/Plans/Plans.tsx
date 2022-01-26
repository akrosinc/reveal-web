import React, { useState, useEffect } from 'react';
import { Button, Table } from 'react-bootstrap';
import { PageableModel } from '../../../../api/providers';
import { PAGINATION_DEFAULT_SIZE, PLAN_TABLE_COLUMNS } from '../../../../constants';
import { getPlanList } from '../../api';
import { PlanModel } from '../../providers/types';
import CreatePlan from './create';

const Plans = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [planList, setPlanList] = useState<PageableModel<PlanModel>>();

  useEffect(() => {
    getPlanList(PAGINATION_DEFAULT_SIZE, 0).then(res => {
      console.log(res);
      setPlanList(res);
    });
  }, []);

  return (
    <>
      <h2>
        Plans(0)
        <Button className="float-end" onClick={() => setShowCreate(true)}>
          Create
        </Button>
      </h2>
      <hr className="my-4" />
      {planList !== undefined && planList.content.length > 0 ? (
        <Table bordered responsive hover>
          <thead className="border border-2">
            <tr>
              {PLAN_TABLE_COLUMNS.map(el => (
                <th key={el.name}>{el.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {planList.content.map(el => <tr>
              <td>{el.identifier}</td>
              <td>{el.name}</td>
              <td>{el.name}</td>
              <td>{el.name}</td>
              <td>{el.name}</td>
              <td>{el.name}</td>
              <td><Button>Activate</Button></td>
            </tr>)}
          </tbody>
        </Table>
      ) : (
        <p className="text-center lead">No plans found.</p>
      )}
      <CreatePlan show={showCreate} handleClose={() => setShowCreate(false)} />
    </>
  );
};

export default Plans;
