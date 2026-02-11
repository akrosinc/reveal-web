import React, { ChangeEvent, useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { WizardStepProps } from '../Wizard/Wizard';

/* -------------------- Static Dropdown Data -------------------- */
const hierarchyOptions = [
    { value: 'country', label: 'Country', nodeOrder: ['region', 'district'] },
    { value: 'region', label: 'Region', nodeOrder: ['district'] }
];

const interventionOptions = [
    { value: 'full', label: 'Full Intervention' },
    { value: 'lite', label: 'Lite Intervention' }
];

/* -------------------- Types -------------------- */
interface RegisterValues {
    name: string;
    title: string;
    effectivePeriod: {
        start: Date;
        end: Date;
    };
    locationHierarchy: string;
    interventionType: string;
    hierarchyLevelTarget?: string;
}

const REGEX_TITLE_VALIDATION = /^[A-Za-z0-9\s-]+$/;

const CreateInstance: React.FC<WizardStepProps> = ({ onNext, defaultValues }) => {
    // Initialize form state from defaultValues (received from Wizard)
    // We lift state up by using defaultValues to initialize, and onNext to save.

    // Note: react-select values need object { value, label }, so we might need to find them again based on stored string values
    const getInitialHierarchy = () => {
        if (defaultValues?.locationHierarchy) {
            return hierarchyOptions.find(opt => opt.value === defaultValues.locationHierarchy) || null;
        }
        return null;
    };
    const getInitialIntervention = () => {
        if (defaultValues?.interventionType) {
            return interventionOptions.find(opt => opt.value === defaultValues.interventionType) || null;
        }
        return null;
    };


    const [selectedHierarchy, setSelectedHierarchy] = useState<any>(getInitialHierarchy());
    const [selectedIntervention, setSelectedIntervention] = useState<any>(getInitialIntervention());

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors }
    } = useForm<RegisterValues>({
        mode: 'onChange',
        defaultValues: {
            name: defaultValues?.name || '',
            title: defaultValues?.title || '',
            effectivePeriod: {
                start: defaultValues?.effectivePeriod?.start ? new Date(defaultValues.effectivePeriod.start) : undefined,
                end: defaultValues?.effectivePeriod?.end ? new Date(defaultValues.effectivePeriod.end) : undefined
            },
            locationHierarchy: defaultValues?.locationHierarchy || '',
            interventionType: defaultValues?.interventionType || '',
            hierarchyLevelTarget: defaultValues?.hierarchyLevelTarget || ''
        }
    });

    const onSubmit = (data: RegisterValues) => {
        // Pass data to next step
        onNext && onNext(data);
    };

    const populateNameHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setValue('name', e.target.value.replaceAll(' ', '-').toLowerCase());
    };

    const startDate = watch('effectivePeriod.start');

    /* ========================== UI ========================== */

    return (
        <Row className="p-4 bg-white">
            <Col md={8} className="">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    {/* Hidden Name */}
                    <Form.Group className="mb-3 d-none">
                        <Form.Control {...register('name')} />
                    </Form.Group>

                    {/* Title */}
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter plan title"
                            isInvalid={!!errors.title}
                            {...register('title', {
                                required: 'Title is required',
                                minLength: {
                                    value: 2,
                                    message: 'Minimum 2 characters required'
                                },
                                maxLength: {
                                    value: 80,
                                    message: 'Maximum 80 characters allowed'
                                },
                                pattern: {
                                    value: REGEX_TITLE_VALIDATION,
                                    message: 'Only letters, numbers, spaces and hyphen allowed'
                                }
                            })}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                register('title').onChange(e);
                                populateNameHandler(e);
                            }}
                        />
                        <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
                    </Form.Group>
                    <Row>
                        {/* Start Date */}
                        <Col>
                            <Form.Group className="mb-2">
                                <Form.Label>Start Date</Form.Label>
                                <Controller
                                    control={control}
                                    name="effectivePeriod.start"
                                    rules={{
                                        required: 'Start date is required'
                                    }}
                                    render={({ field }) => (
                                        <DatePicker
                                            selected={field.value}
                                            onChange={field.onChange}
                                            className={`form-control ${errors.effectivePeriod?.start ? 'is-invalid' : ''}`}
                                            dateFormat="yyyy-MM-dd"
                                            minDate={new Date()}
                                        />
                                    )}
                                />
                                <div className="invalid-feedback d-block">{errors.effectivePeriod?.start?.message}</div>
                            </Form.Group>
                        </Col>

                        {/* End Date */}
                        <Col>
                            <Form.Group className="mb-2">
                                <Form.Label>End Date</Form.Label>
                                <Controller
                                    control={control}
                                    name="effectivePeriod.end"
                                    rules={{
                                        required: 'End date is required',
                                        validate: value => value > startDate || 'End date must be after start date'
                                    }}
                                    render={({ field }) => (
                                        <DatePicker
                                            selected={field.value}
                                            onChange={field.onChange}
                                            className={`form-control ${errors.effectivePeriod?.end ? 'is-invalid' : ''}`}
                                            dateFormat="yyyy-MM-dd"
                                            minDate={startDate}
                                            disabled={!startDate}
                                        />
                                    )}
                                />
                                <div className="invalid-feedback d-block">{errors.effectivePeriod?.end?.message}</div>
                            </Form.Group>
                        </Col>
                    </Row>
                    {/* Location Hierarchy */}
                    <Form.Group className="mb-3">
                        <Form.Label>Location Hierarchy</Form.Label>
                        <Controller
                            control={control}
                            name="locationHierarchy"
                            rules={{
                                required: 'Hierarchy selection is required'
                            }}
                            render={({ field }) => (
                                <Select
                                    options={hierarchyOptions}
                                    value={selectedHierarchy}
                                    onChange={(val: any) => {
                                        setSelectedHierarchy(val);
                                        field.onChange(val?.value);
                                    }}
                                />
                            )}
                        />
                        <div className="text-danger small mt-1">{errors.locationHierarchy?.message}</div>
                    </Form.Group>

                    {/* Intervention Type */}
                    <Form.Group className="mb-3">
                        <Form.Label>Intervention Type</Form.Label>
                        <Controller
                            control={control}
                            name="interventionType"
                            rules={{
                                required: 'Intervention type is required'
                            }}
                            render={({ field }) => (
                                <Select
                                    options={interventionOptions}
                                    value={selectedIntervention}
                                    onChange={(val: any) => {
                                        setSelectedIntervention(val);
                                        field.onChange(val?.value);
                                    }}
                                />
                            )}
                        />
                        <div className="text-danger small mt-1">{errors.interventionType?.message}</div>
                    </Form.Group>

                    {/* Hierarchy Level Target (Conditional) */}
                    {selectedIntervention?.label?.toLowerCase().includes('lite') && (
                        <Form.Group className="mb-3">
                            <Form.Label>Hierarchy Level Target</Form.Label>
                            <Controller
                                control={control}
                                name="hierarchyLevelTarget"
                                rules={{
                                    required: 'Hierarchy level target is required for Lite intervention'
                                }}
                                render={({ field }) => (
                                    <Select
                                        options={
                                            selectedHierarchy?.nodeOrder?.map((el: string) => ({
                                                label: el,
                                                value: el
                                            })) || []
                                        }
                                        value={
                                            selectedHierarchy?.nodeOrder?.map((el: string) => ({
                                                label: el,
                                                value: el
                                            })).find((opt: any) => opt.value === watch('hierarchyLevelTarget'))
                                        }
                                        onChange={(val: any) => field.onChange(val?.value)}
                                    />
                                )}
                            />
                            <div className="text-danger small mt-1">{errors.hierarchyLevelTarget?.message}</div>
                        </Form.Group>
                    )}
                    <div className="d-flex  justify-content-end mt-4">
                        <Button type="submit" className="">
                            Next and Continue
                        </Button>
                    </div>
                </Form>
            </Col>
        </Row>
    );
};

export default CreateInstance;