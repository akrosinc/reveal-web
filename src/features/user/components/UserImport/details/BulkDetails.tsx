import React from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import { PageableModel } from '../../../../../api/providers';
import Paginator from '../../../../../components/Pagination';
import { formatDate } from '../../../../../utils';
import { BulkDetailsModel, UserBulk } from '../../../providers/types';

interface Props {
  userList: PageableModel<BulkDetailsModel>;
  bulkFile?: UserBulk;
  handleClose: () => void;
  paginationHandler: (size: number, page: number) => void;
}

const BulkDetails = ({ userList, bulkFile, handleClose, paginationHandler }: Props) => {
  return (
    <Modal show={true} centered size="lg" scrollable>
      <Modal.Header>
        <Modal.Title>{bulkFile?.filename}</Modal.Title>
        <div>
        <p className="mb-0 ms-2 text-end">Upload date: {formatDate(bulkFile?.uploadDatetime)}</p>
        <p className="mb-0 ms-2 text-end">Uploaded by: {bulkFile?.uploadedBy}</p>
        </div>
      </Modal.Header>
      <Modal.Body>
        <Table bordered responsive>
          <thead className="border border-2">
            <tr>
              <th>Username</th>
              <th>Message</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {userList.content.map((user, index) => (
              <tr key={index}>
                <td>{user.username}</td>
                <td>{user.message}</td>
                <td>{user.status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {userList.content.length > 5 ? (
          <Paginator
            totalElements={userList.totalElements}
            page={userList.pageable.pageNumber}
            size={userList.size}
            totalPages={userList.totalPages}
            paginationHandler={paginationHandler}
          />
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BulkDetails;
