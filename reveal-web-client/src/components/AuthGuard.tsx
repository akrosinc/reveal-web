import { useAppSelector } from '../store/hooks';
import { Navigate } from 'react-router';


interface Props {
  children: JSX.Element
}

//We will use auth guard to protect routes based on user role

const AuthGuard = ({ children }: Props) => {
  const user = useAppSelector((state) => state.user.value);
  return user.name !== "" ? children : <Navigate to="/" />;
}

export default AuthGuard;