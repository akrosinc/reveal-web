import React, { useEffect, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import { getCampaignResource, getQuestionsResource } from '../../api';
import { ResourceCampaign, ResourceQuestion } from '../../providers/types';
import DynamicFormField from './DynamicFormField/DynamicFormField';

const InputsTab = () => {
  const [campaignList, setCampaignList] = useState<ResourceCampaign[]>([]);
  const [questionList, setQuestionList] = useState<ResourceQuestion[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [stepTwo, setStepTwo] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    watch
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
            {questionList.map((el, index) =>
              el.skipPattern === undefined ? (
                <DynamicFormField el={el} errors={errors} register={register} control={control} key={index} />
              ) : watch()[el.skipPattern.skipFieldName] !== el.skipPattern.skipValue ? (
                <DynamicFormField el={el} errors={errors} register={register} control={control} key={index} />
              ) : undefined
            )}
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
