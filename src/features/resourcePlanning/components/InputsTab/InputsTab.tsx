import React, { useEffect, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import {
  getCampaignResource,
  getQuestionsResource,
  getQuestionsResourceStepTwo,
  getResourceDashboard
} from '../../api';
import {
  ResourceCampaign,
  ResourceDashboardRequest,
  ResourceQuestion,
  ResourceQuestionStepTwo
} from '../../providers/types';
import DynamicFormField from './DynamicFormField/DynamicFormField';
import Select from 'react-select';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../../../store/hooks';
import { setDashboard } from '../../../reducers/resourcePlanningConfig';

const InputsTab = () => {
  const [questionList, setQuestionList] = useState<ResourceQuestion[]>([]);
  const [questionListStepTwo, setQuestionListStepTwo] = useState<ResourceQuestionStepTwo[]>();
  const [stepTwo, setStepTwo] = useState(false);
  const configValue = useSelector((state: RootState) => state.resourceConfig.value);
  const [campaignList, setCampaignList] = useState<ResourceCampaign[]>([]);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const location = useLocation();
  const shouldReset = location.state?.shouldReset;

  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    watch,
    reset
  } = useForm();

  useEffect(() => {
    if (shouldReset) {
      reset();
      setStepTwo(false);
    }
  }, [shouldReset, reset]);

  const submitHandler = (form: { [x: string]: string }) => {
    if (stepTwo) {
      const [stepOneAnswers, stepTwoAnswers] = [new Map<string, string>(), new Map<string, string>()];
      Object.keys(form).forEach(el => {
        if (questionList.some(q => q.fieldName === el)) {
          stepOneAnswers.set(el, form[el]);
        } else {
          stepTwoAnswers.set(el, form[el]);
        }
      });
      if (configValue) {
        const dashboardRequest: ResourceDashboardRequest = {
          name: configValue.resourcePlanName,
          country: configValue.country.value,
          campaign: form.campaign,
          minimalAgeGroup: form.ageGroup,
          countBasedOnImportedLocations: configValue.structureCount,
          locationHierarchy: {
            identifier: configValue.hierarchy.value,
            type: configValue.hierarchy.type,
            nodeOrder: configValue.hierarchy.nodeOrder
          },
          lowestGeography: configValue.lowestLocation.value,
          populationTag: configValue.populationTag.value,
          structureCountTag: configValue.structureCountTag ? configValue.structureCountTag.value : undefined,
          stepOneAnswers: Object.fromEntries(stepOneAnswers.entries()),
          stepTwoAnswers: Object.fromEntries(stepTwoAnswers.entries())
        };

        // getHierarchyById(configValue.hierarchy.nodeOrder).then(hierarchyList => {
        const allowedPath: string[] = [];
        configValue.hierarchy.nodeOrder?.some(el => {
          if (el === configValue.lowestLocation.value) {
            allowedPath.push(el);
            return true;
          } else {
            allowedPath.push(el);
          }
          return false;
        });
        getResourceDashboard(dashboardRequest, true)
          .then(res => {
            navigate('dashboard');
            dispatch(
              setDashboard({
                request: dashboardRequest,
                response: res,
                questionsOne: questionList,
                questionsTwo: questionListStepTwo,
                path: allowedPath
              })
            );
          })
          .catch(err => {
            toast.error(err);
          });
      }
    } else {
      getQuestionsResourceStepTwo({
        countryIdentifiers: [configValue?.country.value],
        ageGroupKey: form.ageGroup,
        campaignIdentifiers: [form.campaign]
      }).then(res => {
        setQuestionListStepTwo(res);
        setStepTwo(true);
      });
    }
  };

  useEffect(() => {
    getCampaignResource()
      .then(res => setCampaignList(res))
      .catch(err => toast.error(err));
    getQuestionsResource()
      .then(res => setQuestionList(res))
      .catch(err => toast.error(err));
  }, []);

  return (
    <Container className="mt-4">
      <>
        <h2>Step 1</h2>
        <Form>
          <Form.Group>
            <Form.Label>Which campaign(s) are you planning in the selected locations?</Form.Label>
            <Controller
              control={control}
              name="campaign"
              rules={{ required: { value: true, message: 'Selecting an answer is required.' }, minLength: 1 }}
              render={({ field: { onChange, onBlur, ref } }) => (
                <Select
                  options={campaignList.map(el => {
                    return {
                      value: el.identifier,
                      label: el.name
                    };
                  })}
                  onBlur={onBlur}
                  ref={ref}
                  onChange={el => onChange(el?.value)}
                />
              )}
            />
            {errors['campaign'] && <Form.Label className="text-danger">{errors['campaign'].message}</Form.Label>}
          </Form.Group>
          {questionList.map((el, index) =>
            el.skipPattern === undefined ? (
              <DynamicFormField el={el} errors={errors} register={register} control={control} key={index} />
            ) : watch()[el.skipPattern.skipFieldName] !== el.skipPattern.skipValue ? (
              <DynamicFormField el={el} errors={errors} register={register} control={control} key={index} />
            ) : undefined
          )}
          <hr className="mt-4" />
          <Form.Group>
            <Form.Label>What is the first Age Group targeted with this campaign?</Form.Label>
            <Form.Select {...register('ageGroup', { required: 'This field is required' })}>
              <option>Select...</option>
              {configValue?.country.ageGroups.map(el => (
                <option key={el.key} value={el.key}>
                  {el.name}
                </option>
              ))}
            </Form.Select>
            {errors['ageGroup'] && <Form.Label className="text-danger">{errors['ageGroup'].message}</Form.Label>}
          </Form.Group>
        </Form>
      </>
      {stepTwo ? (
        <>
          <h2>Step 2</h2>
          <hr />
          {questionListStepTwo?.map(question => {
            return (
              <React.Fragment key={question.country}>
                <h2 className="my-4">{question.country}</h2>
                {question.questions.map((el, index) =>
                  el.skipPattern === undefined ? (
                    <DynamicFormField el={el} errors={errors} register={register} control={control} key={index} />
                  ) : watch()[el.skipPattern.skipFieldName] !== el.skipPattern.skipValue ? (
                    <DynamicFormField el={el} errors={errors} register={register} control={control} key={index} />
                  ) : undefined
                )}
              </React.Fragment>
            );
          })}
        </>
      ) : null}
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
