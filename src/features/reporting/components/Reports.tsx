import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Column } from 'react-table';
import MapViewDetail from '../../../components/MapBox/MapViewDetail';
import ReportsTable from '../../../components/Table/ReportsTable';
import { REPORTS_TABLE_COLUMNS } from '../../../constants';
import Dashboard from '../../dashboard';

const Reports = () => {
  const columns = React.useMemo<Column[]>(
    () => [
      {
        // Build our expander column
        id: 'expander', // Make sure it has an ID
        Cell: ({ row }: { row: any }) =>
          // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
          // to build the toggle for expanding a row
          row.canExpand ? (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  // We can even use the row.depth property
                  // and paddingLeft to indicate the depth
                  // of the row
                  padding: '0.4em'
                }
              })}
            >
              {row.isExpanded ? (
                <FontAwesomeIcon className="ms-1" icon="chevron-down" />
              ) : (
                <FontAwesomeIcon className={row.depth > 0 ? 'ms-2' : 'ms-1'} icon="chevron-right" />
              )}
            </span>
          ) : null
      },
      ...REPORTS_TABLE_COLUMNS
    ],
    []
  );


  return <>
  <ReportsTable columns={columns} data={[]} />
  <Row>
    <Col className='my-auto' md={5}>
    <Dashboard />
    </Col>
    <Col md={7}>
    <MapViewDetail />
    </Col>
  </Row>
  </>;
};

export default Reports;
