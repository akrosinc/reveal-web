import React, {useEffect, useState} from 'react';
import {Button, Col, Form, Row, Table} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getLocationHierarchyList } from '../../../location/api';
import {downloadAmdrImportTemplate, getAmdrImportResults, getAmdrKeys} from '../../api';
import {AmdrImportResultsResponse} from "../../type";

export const AmdrImportStatus = () => {

  const [importDetails, setImportDetails] = useState<AmdrImportResultsResponse>();

  useEffect(() => {
    let isMounted = true;

    getAmdrImportResults()
    .then(res => {
      if (isMounted) {
        setImportDetails(res);
      }
    })
    .catch(err => {
      if (isMounted) {
        toast.error(err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
      <>
        {!importDetails && (
            <div className="text-center py-4 text-muted">
              Loading import status...
            </div>
        )}

        {importDetails && (
            <div className="col-lg-8 col-md-10 mx-auto">
              <div className="border rounded p-3 shadow-sm bg-white">
                <h6 className="mb-3 fw-semibold">
                  Import Status Summary
                </h6>

                <Table bordered hover responsive className="mb-0 align-middle">
                  <thead className="table-light">
                  <tr>
                    <th>Status</th>
                    <th className="text-end">Count</th>
                  </tr>
                  </thead>

                  <tbody>
                  {importDetails.statuses?.map((status) => (
                      <tr key={status.status}>
                        <td>{status.status}</td>
                        <td className="text-end">
                  <span className="badge bg-secondary">
                    {status.count}
                  </span>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </Table>

              </div>
            </div>
        )}
      </>);
};

export default AmdrImportStatus;
