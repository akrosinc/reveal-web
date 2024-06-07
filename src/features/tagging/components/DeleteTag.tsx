import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { TagToDelete } from './ComplexTagging';

interface Props {
  showDeleteTagPanel: boolean;
  setShowDeleteTagPanel: (show: boolean) => void;
  selectedTagToDelete?: TagToDelete;
  selectedTagsToDelete?: TagToDelete[];
  proceedToDeleteTag?: (tag?: TagToDelete) => void;
  proceedToDeleteTags?: (tag?: TagToDelete[]) => void;
}

const DeleteTag = ({
  showDeleteTagPanel,
  setShowDeleteTagPanel,
  selectedTagToDelete,
  proceedToDeleteTag,
  proceedToDeleteTags,
  selectedTagsToDelete
}: Props) => {
  return (
    <Modal size={'lg'} centered show={showDeleteTagPanel} onHide={() => setShowDeleteTagPanel(false)}>
      <Modal.Header closeButton>Delete Tag</Modal.Header>

      <Modal.Body>
        {selectedTagsToDelete && selectedTagsToDelete?.length > 0
          ? 'Are you sure you want to delete the following tags:'
          : 'Are you sure you want to delete tag:'}

        <>
          {selectedTagsToDelete && selectedTagsToDelete?.length > 0
            ? selectedTagsToDelete.map(tag => <p>{tag.tag}</p>)
            : selectedTagToDelete?.tag}
        </>
      </Modal.Body>
      <Modal.Footer>
        <Button variant={'secondary'} onClick={() => setShowDeleteTagPanel(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (selectedTagsToDelete && selectedTagsToDelete?.length > 0 && proceedToDeleteTags !== undefined) {
              proceedToDeleteTags(selectedTagsToDelete);
            } else {
              if (proceedToDeleteTag !== undefined) proceedToDeleteTag(selectedTagToDelete);
            }
          }}
        >
          Proceed
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default DeleteTag;
