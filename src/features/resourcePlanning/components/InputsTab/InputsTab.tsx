import React, { useEffect, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { getCampaignResource, getQuestionsResource } from '../../api';
import { ResourceCampaign, ResourceQuestion } from '../../providers/types';

const InputsTab = () => {
  const [campaignList, setCampaignList] = useState<ResourceCampaign[]>([]);
  const [questionList, setQuestionList] = useState<ResourceQuestion[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [stepTwo, setStepTwo] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    control
  } = useForm();

  const submitHandler = (form: any) => {
    console.log(form, selectedCampaigns);
  };

  useEffect(() => {
    getCampaignResource().then(res => setCampaignList(res));
    getQuestionsResource().then(res => setQuestionList(res));
  }, []);

  return (
    <Container className="mt-4">
      {!stepTwo ? (
        <>
          <Form.Label>Which campaign(s) are you planning in the selected locations?</Form.Label>
          <Select
            options={campaignList.map(el => {
              return {
                value: el.identifier,
                label: el.name
              };
            })}
            isMulti
            onChange={el => setSelectedCampaigns(el.map(el => el.value))}
          />
          <hr className="my-4" />
          <h2>Step 1</h2>
          <Form>
            {questionList.map((el, index) => (
              <Form.Group className="my-2" key={index}>
                <Form.Label>{el.question}</Form.Label>
                {el.fieldType.inputType === 'STRING' && (
                  <Form.Control
                    {...register(el.fieldName as any, { required: 'This field can not be empty.' })}
                    type="text"
                  />
                )}
                {(el.fieldType.inputType === 'DECIMAL' || el.fieldType.inputType === 'INTEGER') && (
                  <Form.Control
                    {...register(el.fieldName as any, { required: 'This field can not be empty.' })}
                    type="number"
                    min={el.fieldType.min}
                    max={el.fieldType.max}
                  />
                )}
                {el.fieldType.inputType === 'DROPDOWN' && (
                  <Controller
                    control={control}
                    name={el.fieldName as any}
                    rules={{ required: { value: true, message: 'Selecting an answer is required.' }, minLength: 1 }}
                    render={({ field: { onChange, onBlur, ref, value } }) => (
                      <Form.Select onChange={onChange} value={value} ref={ref} onBlur={onBlur}>
                        <option>Select...</option>
                        {el.fieldType.values.map((el, i) => (
                          <option key={i} value={el}>
                            {el}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  />
                )}
                {errors[el.fieldName] && (
                  <Form.Label className="text-danger">{errors[el.fieldName].message}</Form.Label>
                )}
              </Form.Group>
            ))}
          </Form>
        </>
      ) : (
        <h2>Step 2</h2>
      )}
      <div className="text-end my-4">
        {stepTwo && (
          <Button className="px-5 me-2" onClick={() => setStepTwo(false)}>
            Back
          </Button>
        )}
        <Button className="px-5" onClick={handleSubmit(submitHandler)}>
          {stepTwo ? 'Submit' : 'Next'}
        </Button>
      </div>
    </Container>
  );
};

export default InputsTab;
