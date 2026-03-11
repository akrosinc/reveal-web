import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Goal } from '../../../../../plan/providers/types';
import { useAppSelector } from '../../../../../../store/hooks';
import { useTranslation } from 'react-i18next';

interface Props {
    show: boolean;
    planId?: string;
    currentGoal?: Goal;
    closeHandler: () => void;
    goalList: Goal[];
    onSave?: (goal: Goal) => void;
}

interface goalForm {
    description: string;
    priority: string;
}

const CreateGoal = ({ show, currentGoal, closeHandler, goalList, onSave }: Props) => {
    const isDarkMode = useAppSelector((state) => state.darkMode.value);
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<goalForm>({
        defaultValues: {
            description: currentGoal?.description,
            priority: currentGoal?.priority
        }
    });
    const { t } = useTranslation();

    const submitHandler = (form: goalForm) => {
        // Logic for static data (no API calls)
        if (currentGoal) {
            currentGoal.description = form.description;
            currentGoal.priority = form.priority;
            if (onSave) onSave(currentGoal);
            closeHandler();
        } else {
            let newGoal: Goal = {
                actions: [],
                description: form.description,
                identifier: String(goalList.length + 1),
                priority: form.priority
            };
            goalList.push(newGoal);
            if (onSave) onSave(newGoal);
            closeHandler();
        }
    };

    return (
        <Modal
            show={show}
            centered
            backdrop="static"
            onHide={closeHandler}
            contentClassName={isDarkMode ? 'bg-dark' : 'bg-white'}
        >
            <Modal.Header closeButton>
                <Modal.Title>{currentGoal ? t('planPage.editGoal') : t('planPage.createGoal')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('planPage.description')}</Form.Label>
                        <Form.Control
                            id="goal-description-input"
                            placeholder={t('planPage.enterPlanDescription')}
                            type="text"
                            {...register('description', {
                                required: 'Description must not be empty.',
                                minLength: {
                                    value: 1,
                                    message: 'Description must contain at least 1 charater.'
                                }
                            })}
                        />
                        {errors.description && <Form.Label className="text-danger">{errors.description.message}</Form.Label>}
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button id="cancel-goal-button" variant="secondary" onClick={closeHandler}>
                    Cancel
                </Button>
                <Button id="submit-goal-button" onClick={handleSubmit(submitHandler)}>
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateGoal;
