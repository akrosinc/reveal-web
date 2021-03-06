import React from 'react';
import { Button, Modal, Spinner, Table } from 'react-bootstrap';
import { LocationBulkModel, LocationBulkDetailsModel, LocationBulkStatus } from '../../../providers/types';
import { formatDate } from '../../../../../utils';
import { PageableModel } from '../../../../../api/providers';
import Paginator from '../../../../../components/Pagination';
import { useAppSelector } from '../../../../../store/hooks';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

interface Props {
  closeHandler: () => void;
  locationBulkFile: LocationBulkModel;
  locationList: PageableModel<LocationBulkDetailsModel>;
  paginationHandler: (size: number, page: number) => void;
}

const LocationBulkDetails = ({ closeHandler, locationBulkFile, locationList, paginationHandler }: Props) => {
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  return (
    <Modal show centered size="lg" contentClassName={isDarkMode ? 'bg-dark' : 'bg-white'}>
      <Modal.Header>
        <Modal.Title style={{ wordBreak: 'break-word' }}>
          {locationBulkFile.filename}({locationList.totalElements})<br />
          <small>
            Bulk Status: {locationBulkFile.status}
            {locationBulkFile.status !== LocationBulkStatus.COMPLETE && (
              <Spinner animation="grow" variant="success" style={{ marginBottom: '-4px', marginLeft: '0.5em' }} />
            )}
          </small>
        </Modal.Title>
        <div>
          <p className="mb-0 ms-2 text-end">Upload date: {formatDate(locationBulkFile.uploadDatetime)}</p>
          <p className="mb-0 ms-2 text-end">Uploaded by: {locationBulkFile.uploadedBy}</p>
        </div>
      </Modal.Header>
      <Modal.Body>
        <SimpleBar style={{ maxHeight: '65vh' }}>
          <Table bordered responsive variant={isDarkMode ? 'dark' : 'white'}>
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
        </SimpleBar>
        <Paginator
          totalElements={locationList.totalElements}
          size={locationList.size}
          page={locationList.pageable.pageNumber}
          paginationHandler={paginationHandler}
          totalPages={locationList.totalPages}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button id="close-button" variant="secondary" onClick={closeHandler}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LocationBulkDetails;
