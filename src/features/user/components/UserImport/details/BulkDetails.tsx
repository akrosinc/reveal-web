import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { PageableModel } from '../../../../../api/providers';
import Paginator from '../../../../../components/Pagination';
import DefaultTable from '../../../../../components/Table/DefaultTable';
import { useAppSelector } from '../../../../../store/hooks';
import { formatDate } from '../../../../../utils';
import { BulkDetailsModel, UserBulk } from '../../../providers/types';

interface Props {
  userList: PageableModel<BulkDetailsModel>;
  bulkFile?: UserBulk;
  handleClose: () => void;
  paginationHandler: (size: number, page: number) => void;
}

const BulkDetails = ({ userList, bulkFile, handleClose, paginationHandler }: Props) => {
  const isDarkMode = useAppSelector(state => state.darkMode.value);
  return (
    <Modal show={true} centered size="lg" scrollable contentClassName={isDarkMode ? 'bg-dark' : 'bg-white'}>
      <Modal.Header>
        <Modal.Title>
          {bulkFile?.filename}({userList.totalElements})
        </Modal.Title>
        <div>
          <p className="mb-0 ms-2 text-end">Upload date: {formatDate(bulkFile?.uploadDatetime)}</p>
          <p className="mb-0 ms-2 text-end">Uploaded by: {bulkFile?.uploadedBy}</p>
        </div>
      </Modal.Header>
      <Modal.Body>
        <DefaultTable
          columns={[
            { name: 'Username', accessor: 'username' },
            { name: 'Message', accessor: 'message' },
            { name: 'Status', accessor: 'status' }
          ]}
          data={userList.content}
        />
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
        <Button id="close-button" variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BulkDetails;
