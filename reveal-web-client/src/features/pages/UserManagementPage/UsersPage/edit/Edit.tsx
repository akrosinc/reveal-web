import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";

const EditUser = () => {
  let { userId } = useParams();
  return (
    <Container>
        <h2 className="text-center">Edit User
        <br/>
        UserId: {userId}
        </h2>
    </Container>
  );
};

export default EditUser;
