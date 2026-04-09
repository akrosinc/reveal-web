import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Action } from '../../../../../plan/providers/types';
import { getActionTitles, getformList } from '../../../../../plan/api';
import Moment from 'moment';
import { toUtcString } from '../../../../../../utils';
import { useAppSelector } from '../../../../../../store/hooks';
import { useTranslation } from 'react-i18next';

interface Props {
  selectedAction?: Action;
  closeHandler: (action?: Action, isDeleted?: boolean) => void;
  planPeriod: {
    start: Date;
    end: Date;
  };
  viewOnly?: boolean;
}

const Actions = ({ closeHandler, planPeriod, selectedAction, viewOnly }: Props) => {
    const [actionTitles, setActionTitles] = useState<string[]>([]);
    const isDarkMode = useAppSelector(state => state.darkMode.value);

    useEffect(() => {
        getActionTitles().then(res => setActionTitles(res));
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        setValue
    } = useForm<Action>({
        defaultValues: {
            conditions: selectedAction?.conditions,
            description: selectedAction?.description,
            identifier: selectedAction?.identifier,
            title: selectedAction?.title,
            timingPeriod:
                selectedAction !== undefined
                    ? {
                        start: Moment(selectedAction.timingPeriod.start).toDate(),
                        end: Moment(selectedAction.timingPeriod.end).toDate()
                    }
                    : planPeriod
        }
    });
    useEffect(() => {
        if (selectedAction?.title && actionTitles.length > 0) {
            setValue('title', selectedAction.title);
        }
    }, [actionTitles, selectedAction, setValue]);

    const { t } = useTranslation();

    useEffect(() => {
        getformList().then(res => {
            setValue('formIdentifier', selectedAction?.formIdentifier ?? '');
        });
    }, [setValue, selectedAction]);


    const submitHandler = (formData: any) => {
        formData.timingPeriod.start = toUtcString(formData.timingPeriod.start);
        formData.timingPeriod.end = toUtcString(formData.timingPeriod.end);
        closeHandler(formData);
    };

    return (
        <Modal
            show={true}
            onHide={() => closeHandler()}
            backdrop="static"
            keyboard={false}
            centered
            contentClassName={isDarkMode ? 'bg-dark' : 'bg-white'}
        >
            <Modal.Header closeButton>
                <Modal.Title>{viewOnly ? 'View Action' : (selectedAction ? t('planPage.editAction') : t('planPage.createAction'))}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('planPage.Title')}</Form.Label>
                        <Form.Select
                            id="action-title-input"
                            disabled={viewOnly}
                            {...register('title', {
                                required: 'Action title must be selected.',
                            })}
                        >
                            <option value="">Select an action title</option>
                            {actionTitles.map((el, index) => (
                                <option key={index} value={el}>
                                    {el}
                                </option>
                            ))}
                        </Form.Select>
                        {errors.title && <Form.Label className="text-danger">{errors.title.message}</Form.Label>}
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    id="action-discard-button"
                    variant="secondary"
                    className={viewOnly ? "mx-auto" : "me-auto"}
                    onClick={() => {
                        closeHandler();
                    }}
                >
                    {viewOnly ? 'Close' : 'Discard'}
                </Button>
                {!viewOnly && (
                    <>
                        {selectedAction && <Button onClick={() => closeHandler(selectedAction, true)}>Delete</Button>}
                        <Button id="action-save-button" disabled={!isDirty} onClick={handleSubmit(submitHandler)}>
                            {selectedAction ? 'Save Changes' : 'Create Action'}
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default Actions;
