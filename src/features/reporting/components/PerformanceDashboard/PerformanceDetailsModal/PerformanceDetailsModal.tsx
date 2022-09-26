import React from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import { PerformanceDashboardModel } from '../../../providers/types';

interface Props {
  closeHandler: () => void;
  data: PerformanceDashboardModel[];
  title: string;
  darkMode: boolean;
}

const PerformanceDetailsModal = ({ closeHandler, data, title, darkMode }: Props) => {
  return (
    <Modal
      show
      centered
      onHide={closeHandler}
      backdrop="static"
      dialogClassName='modal-90w'
      contentClassName={darkMode ? 'bg-dark' : 'bg-white'}
    >
      <Modal.Header closeButton>
        <Modal.Title>Performance Dashboard Details: {title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table hover responsive bordered variant={darkMode ? 'dark' : 'white'}>
          <thead className="border border-2">
            <tr>
              <th>Identifier</th>
              <th>{data[0].userLabel}</th>
              {Object.keys(data[0].columnDataMap).map((el, index) => (
                <th key={index}>{el}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(el => (
              <tr key={el.userId}>
                <td>{el.userId}</td>
                <td>{el.userName}</td>
                {Object.keys(el.columnDataMap).map((columns, index) => (
                  <td key={index}>{el.columnDataMap[columns].value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeHandler}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PerformanceDetailsModal;
