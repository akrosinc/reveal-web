import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { getFailedSurveyRequests, getSurveyData } from '../../api';
import { toast } from 'react-toastify';
import { toEndOfDay, toStartOfDay } from '../../../../utils';
import { BesdFailedIntegrationRetry } from '../types';

export interface SurveyDataRequest {
  downloadType: 'extract' | 'rawdata' | undefined;
  startDate: Date;
  endDate: Date;
}

export interface FormValues {
  downloadType: 'extract' | 'rawdata' | undefined;
  startDate: Date;
  endDate: Date;
}

export interface SurveyDataResponse {}

const options = [
  { value: 'rawdata', label: 'Raw Data' },
  { value: 'extract', label: 'Extract' }
];

const SurveyDashboard = () => {
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<FormValues>();

  const [failedResponses, setFailedResponses] = useState<BesdFailedIntegrationRetry[]>([]);

  const { t } = useTranslation();
  let link = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    getFailedSurveyRequests().then(res => setFailedResponses(res));
  }, []);

  const dataHandler = (formData: FormValues) => {
    if (formData.endDate === undefined) {
      formData.endDate = new Date();
    }
    if (formData.startDate === undefined) {
      formData.startDate = new Date();
    }
    if (formData.downloadType === undefined) {
      formData.downloadType = 'rawdata';
    }

    let request: SurveyDataRequest = {
      downloadType: formData.downloadType,
      startDate: toStartOfDay(formData.startDate).toDate(),
      endDate: toEndOfDay(formData.endDate).toDate()
    };

    getSurveyData(request)
      .then(res => {
        if (link && link.current) {
          link.current.href = window.URL.createObjectURL(new Blob([res], { type: 'application/vnd.ms-excel' }));
          link.current.setAttribute(
            'download',
            formData.downloadType === 'extract'
              ? `ResponseAggregation_${formData.startDate}_${formData.endDate}.xlsx`
              : `RawResponses_${formData.startDate}_${formData.endDate}.xlsx`
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
      {failedResponses.length > 0 && (
        <>
          <hr />
          <h4>ERRORS - Please contact product team</h4>
          <Table>
            <thead>
              <tr>
                <th>id</th>
                <td>Vendor Integration Response Id</td>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Message</th>
                <th>http Code</th>
              </tr>
            </thead>
            <tbody>
              {failedResponses.map(failedResponse => {
                return (
                  <tr>
                    <td>{failedResponse.id}</td>
                    <td>{failedResponse.vendorIntegrationId}</td>
                    <td>{failedResponse.startDate}</td>
                    <td>{failedResponse.endDate}</td>
                    <td>{failedResponse.errorMessage.substr(0, 100)}</td>
                    <td>{failedResponse.httpCode}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
};
export default SurveyDashboard;
