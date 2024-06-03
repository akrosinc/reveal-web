import { Button, Modal } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { BaseTag } from '../planSimulation/providers/types';
import { updateComplexTagGrants, updateEntityTagGrants } from './api';

import TagAccessOrganization from './components/TagAccessOrganization';

interface Props {
  showTagAccess: boolean;
  setShowTagAccess: (val: boolean) => void;
  selectedMetadata: BaseTag[];
  setTagGrantsUpdated: () => void;
  type: 'tag' | 'complexTag';
}

const TagAccess = ({ showTagAccess, setShowTagAccess, selectedMetadata, setTagGrantsUpdated, type }: Props) => {
  const [updatedMetadata, setUpdatedMetadata] = useState<BaseTag[]>([]);

  useEffect(() => {
    setUpdatedMetadata(selectedMetadata);
  }, [selectedMetadata]);

  return (
    <Modal show={showTagAccess} centered size={'xl'} onHide={() => setShowTagAccess(false)}>
      <Modal.Header closeButton>Tag Access</Modal.Header>
      <Modal.Body>
        <TagAccessOrganization
          metadata={selectedMetadata}
          updatedMetadata={updatedMetadata}
          setUpdatedMetadata={setUpdatedMetadata}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            if (type === 'tag') {
              updateEntityTagGrants(
                updatedMetadata.map(meta => {
                  return {
                    identifier: meta.identifier,
                    public: meta.public,
                    resultingOrgs: meta.resultingOrgs,
                    resultingUsers: meta.resultingUsers
                  };
                })
              ).then(() => {
                setTagGrantsUpdated();
              });
            } else if (type === 'complexTag') {
              updateComplexTagGrants(
                updatedMetadata.map(meta => {
                  return {
                    id: meta.identifier,
                    public: meta.public,
                    resultingOrgs: meta.resultingOrgs,
                    resultingUsers: meta.resultingUsers
                  };
                })
              ).then(() => {
                setTagGrantsUpdated();
              });
            }
          }}
        >
          submit
        </Button>
        <Button id="close-button" variant="secondary" onClick={() => setShowTagAccess(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default TagAccess;
