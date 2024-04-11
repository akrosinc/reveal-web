import { Tab, Tabs } from 'react-bootstrap';

const TagAccess = () => {
  return (
    <Tabs defaultActiveKey={'one'}>
      <Tab title={'one'} eventKey={'one'}>
        <p>one</p>
      </Tab>
      <Tab title={'two'} eventKey={'two'}>
        <p>two</p>
      </Tab>
    </Tabs>
  );
};
export default TagAccess;
