import { useState } from 'react';
import StepBasicInfo from './CreateInstance';
// import StepAccess from './steps/StepAccess';
// import StepReview from './steps/StepReview';

const STEPS = {
  BASIC: 0,
  ACCESS: 1,
  REVIEW: 2
};

const CreateUserWizard = () => {
  const [step, setStep] = useState(STEPS.BASIC);
  const [formData, setFormData] = useState({});

  const next = data => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(prev => prev + 1);
  };

  const back = () => setStep(prev => prev - 1);

  const submit = async () => {
    // toast.promise(createUser(formData as CreateUserModel), {
    //   pending: 'Creating user...',
    //   success: 'User created successfully',
    //   error: 'Failed to create user'
    // });
    // // optionally reset
    // setFormData({});
    // setStep(STEPS.BASIC);
  };

  return (
    <div className="user-wizard">
      {step === STEPS.BASIC && <StepBasicInfo onNext={next} defaultValues={formData} />}
      {/* {step === STEPS.ACCESS && <StepAccess onNext={next} onBack={back} defaultValues={formData} />}
      {step === STEPS.REVIEW && <StepReview data={formData} onBack={back} onSubmit={submit} />} */}
    </div>
  );
};

export default CreateUserWizard;
