import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select, { SingleValue } from 'react-select';
import { getSurveyData } from '../../api';
import { toast } from 'react-toastify';

export interface SurveyDataRequest {
  downloadType: 'extract' | 'rawdata' | undefined;
  startDate: Date;
  endDate: Date;
}

export interface SurveyDataResponse {}

interface Options {
  value: string;
  label: string;
}

const options = [
  { value: 'rawdata', label: 'Raw Data' },
  { value: 'extract', label: 'Extract' }
];

const SurveyDashboard = () => {
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<SurveyDataRequest>();
  const { t } = useTranslation();
  let link = useRef<HTMLAnchorElement>(null);

  const dataHandler = (formData: SurveyDataRequest) => {
    if (formData.endDate === undefined) {
      formData.endDate = new Date();
    }
    if (formData.startDate === undefined) {
      formData.startDate = new Date();
    }
    if (formData.downloadType === undefined) {
      formData.downloadType = 'rawdata';
    }
    getSurveyData(formData)
      .then(res => {
        if (link && link.current) {
          link.current.href = window.URL.createObjectURL(new Blob([res], { type: 'application/vnd.ms-excel' }));
          link.current.setAttribute(
            'download',
            formData.downloadType === 'extract'
              ? `ResponseAggregation_${formData.startDate.toDateString()}_${formData.endDate.toDateString()}.xlsx`
              : `RawResponses_${formData.startDate.toDateString()}_${formData.endDate.toDateString()}.xlsx`
          );
          link.current.click();
        }
      })
      .catch(_ => {
        toast.error('unable to download file');
      });
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Form.Group className="mb-2">
            <Form.Label>{t('besdSurvey.downloadType')}</Form.Label>
            <Controller
              control={control}
              name="downloadType"
              render={({ field: { onChange, ref, value, name } }) => {
                return (
                  <Select
                    className="custom-react-select-container"
                    classNamePrefix="custom-react-select"
                    id="downloadType"
                    menuPosition="fixed"
                    placeholder="Select download Type"
                    options={options}
                    defaultValue={options[0]}
                    onChange={selected => {
                      if (selected) {
                        value = selected.value === 'extract' ? 'extract' : 'rawdata';
                        onChange(selected.value);
                      }
                    }}
                  />
                );
              }}
            />
            {errors.downloadType && <Form.Label className="text-danger">{errors.downloadType.message}</Form.Label>}
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <Form.Group className="mb-2">
            <Form.Label>{t('besdSurvey.startDate')}</Form.Label>
            <Controller
              control={control}
              name="startDate"
              // rules={{ required: t('planPage.planForm.startDateError') as string }}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  id="start-date-picker"
                  placeholderText="Select date"
                  onChange={e => {
                    onChange(e);
                  }}
                  selected={value ? value : new Date()}
                  className="form-control"
                  dropdownMode="select"
                  preventOpenOnFocus
                  showPopperArrow={false}
                  popperPlacement="bottom-end"
                  dateFormat="yyyy-MM-dd"
                  maxDate={new Date()}
                />
              )}
            />
            {errors.endDate && <Form.Label className="text-danger">{errors.endDate.message}</Form.Label>}
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group className="mb-2">
            <Form.Label>{t('besdSurvey.endDate')}</Form.Label>
            <Controller
              control={control}
              name="endDate"
              // rules={{ required: t('planPage.planForm.startDateError') as string }}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  id="start-date-picker"
                  placeholderText="Select date"
                  onChange={e => {
                    onChange(e);
                  }}
                  selected={value ? value : new Date()}
                  className="form-control"
                  dropdownMode="select"
                  preventOpenOnFocus
                  showPopperArrow={false}
                  popperPlacement="bottom-end"
                  dateFormat="yyyy-MM-dd"
                  maxDate={new Date()}
                />
              )}
            />
            {errors.endDate && <Form.Label className="text-danger">{errors.endDate.message}</Form.Label>}
          </Form.Group>{' '}
          <a
            style={{ display: 'none' }}
            target={'_blank'}
            ref={link}
            href={'data:text/json;charset=utf-8,'}
            download={'emptyfile.xlsx'}
            rel="noreferrer"
          >
            hidden
          </a>
        </Col>
      </Row>
      <Row>
        {' '}
        <Col md={3}></Col>
        <Col md={3}>
          {' '}
          <Button
            id="submit-survey-data"
            onClick={() => {
              handleSubmit(dataHandler)();
            }}
            className="float-end mt-2"
          >
            {' '}
            {t('besdSurvey.getReport')}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};
export default SurveyDashboard;
