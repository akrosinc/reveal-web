import React, { useEffect, useState } from 'react';
import { Button, Collapse, Modal, Table } from 'react-bootstrap';

interface Props {
    selectedFile: any;
    closeHandler: () => void;
}

const DetailsModal = ({ selectedFile, closeHandler }: Props) => {
    const [importDetails, setImportDetails] = useState<any[]>([]);
    const [showColumn, setShowColumn] = useState<string | undefined>();

    useEffect(() => {
        // Static data instead of API call
        setImportDetails([
            {
                identifier: '1',
                locationName: 'Root Location',
                entityValue: [
                    {
                        tag: 'Tag1',
                        tagData: { value: { valueString: 'Value1' } }
                    }
                ]
            }
        ]);
    }, [selectedFile]);

    return (
        <Modal show centered scrollable size="lg">
            <Modal.Header>
                <Modal.Title>{selectedFile.filename}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {importDetails && importDetails.length > 0 ? (
                    <Table bordered responsive hover>
                        <thead className="border border-2">
                            <tr>
                                <th>Identifier</th>
                                <th>Location Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {importDetails.map(el => (
                                <React.Fragment key={el.identifier}>
                                    <tr
                                        key={el.identifier}
                                        onClick={() => {
                                            if (showColumn !== el.identifier) {
                                                setShowColumn(el.identifier);
                                            } else {
                                                setShowColumn(undefined);
                                            }
                                        }}
                                    >
                                        <td>{el.identifier}</td>
                                        <td>{el.locationName}</td>
                                    </tr>
                                    <Collapse in={showColumn === el.identifier} timeout={0}>
                                        <tr>
                                            <td colSpan={3} className="p-0">
                                                <Table borderless responsive hover className="m-0" style={{ backgroundColor: '#EEEE' }}>
                                                    <thead className="border border-1">
                                                        <tr>
                                                            <th>Tag Name</th>
                                                            <th>Value</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="border border-1">
                                                        {el.entityValue.map((ev: any) => (
                                                            <tr key={Math.random()}>
                                                                <td>{ev.tag}</td>
                                                                <td>
                                                                    {ev.tagData.value.valueDouble !== undefined
                                                                        ? ev.tagData.value.valueDouble
                                                                        : ev.tagData.value.valueString}
                                                                </td>
                                                                <td>Success</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </td>
                                        </tr>
                                    </Collapse>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <p>No data found.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={closeHandler}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DetailsModal;
