import { Button, Modal } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { BaseTag, EntityTagResponse } from '../planSimulation/providers/types';
import { removeComplexTagGrants, removeEntityTagGrants } from './api';

import TagAccessOrganization from './components/TagAccessOrganization';

interface Props {
  showRemoveAccess: boolean;
  setShowRemoveAccess: (val: boolean) => void;
  selectedMetadata: BaseTag[];
  setTagGrantsUpdated: () => void;
  type: 'tag' | 'complexTag';
}

const RemoveTagAccess = ({
  showRemoveAccess,
  setShowRemoveAccess,
  selectedMetadata,
  setTagGrantsUpdated,
  type
}: Props) => {
  const [updatedMetadata, setUpdatedMetadata] = useState<BaseTag[]>([]);

  useEffect(() => {
    setUpdatedMetadata(selectedMetadata);
  }, [selectedMetadata]);

  return (
    <Modal show={showRemoveAccess} centered size={'xl'} onHide={() => setShowRemoveAccess(false)}>
      <Modal.Header closeButton>Remove Access To Tags</Modal.Header>
      <Modal.Body>
        <TagAccessOrganization
          metadata={selectedMetadata}
          updatedMetadata={updatedMetadata}
          setUpdatedMetadata={setUpdatedMetadata}
          addAccess={false}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            if (type === 'tag') {
              const tags = updatedMetadata.map(meta => {
                return {
                  identifier: meta.identifier,
                  public: meta.public,
                  resultingOrgs: meta.resultingOrgs,
                  resultingUsers: meta.resultingUsers
                };
              });
              updatedMetadata
                .filter(
                  updatedMetadataItem =>
                    updatedMetadataItem &&
                    updatedMetadataItem instanceof EntityTagResponse &&
                    (updatedMetadataItem as EntityTagResponse) &&
                    (updatedMetadataItem as EntityTagResponse).children
                )
                .forEach(updatedMetadataItem => {
                  // @ts-ignore
                  (updatedMetadataItem as EntityTagResponse).children.forEach(child => {
                    tags.push({
                      identifier: child.identifier,
                      public: child.public,
                      resultingOrgs: child.resultingOrgs,
                      resultingUsers: child.resultingUsers
                    });
                  });
                });

              removeEntityTagGrants(tags).then(() => {
                setTagGrantsUpdated();
              });
            } else if (type === 'complexTag') {
              removeComplexTagGrants(
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
        <Button id="close-button" variant="secondary" onClick={() => setShowRemoveAccess(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default RemoveTagAccess;
