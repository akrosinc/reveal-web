import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';

interface Props {
  title: string;
  children: JSX.Element;
}

const PopoverComponent = ({ title, children }: Props) => {
  const popover = (
    <Popover id="popover-basic" style={{maxWidth: '285px'}}>
      <Popover.Header as="h3" className="text-center text-dark">
        {title}
      </Popover.Header>
      <Popover.Body>{children}</Popover.Body>
    </Popover>
  );
  return (
    <OverlayTrigger trigger="click" placement="right-start" overlay={popover} rootClose={true}>
      <Button style={{ boxShadow: '4px 4px 3px rgba(24, 24, 24, 0.8)' }}>
        <FontAwesomeIcon icon="info-circle" className="text-white mt-1" />
      </Button>
    </OverlayTrigger>
  );
};

export default PopoverComponent;
