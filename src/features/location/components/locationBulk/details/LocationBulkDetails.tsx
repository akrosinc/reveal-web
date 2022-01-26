import React from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import { LocationBulkModel, LocationBulkDetailsModel } from '../../../providers/types';
import { formatDate } from '../../../../../utils';
import { PageableModel } from '../../../../../api/providers';
import Paginator from '../../../../../components/Pagination';

interface Props {
  closeHandler: () => void;
  locationBulkFile: LocationBulkModel;
  locationList: PageableModel<LocationBulkDetailsModel>;
  paginationHandler: (size: number, page: number) => void;
}

const LocationBulkDetails = ({ closeHandler, locationBulkFile, locationList, paginationHandler }: Props) => {
  return (
    <Modal show centered scrollable size="lg">
      <Modal.Header>
        <Modal.Title>{locationBulkFile.filename}</Modal.Title>
        <div>
          <p className="mb-0 ms-2 text-end">Upload date: {formatDate(locationBulkFile.uploadDatetime)}</p>
          <p className="mb-0 ms-2 text-end">Uploaded by: {locationBulkFile.uploadedBy}</p>
        </div>
      </Modal.Header>
      <Modal.Body>
        <Table bordered responsive>
          <thead className="border border-2">
            <tr>
              <th>Location Name</th>
              <th>Message</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {locationList.content.map((el, index) => (
              <tr key={index}>
                <td>{el.name}</td>
                <td>{el.message}</td>
                <td>{el.status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Paginator
          totalElements={locationList.totalElements}
          size={locationList.size}
          page={locationList.pageable.pageNumber}
          paginationHandler={paginationHandler}
          totalPages={locationList.totalPages}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeHandler}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LocationBulkDetails;