import { Link } from 'react-router-dom';
import logo from '../assets/Logo/Logo-dark.png';
import error from '../assets/NoData.svg';

export default function NotFound() {
  return (
    <div id="NotFound" className="flex flex-col justify-between items-center min-h-screen p-4">
      <img
        src={logo}
        alt="devchallenges logo"
        className="mb-4 max-w-[300px] mx-auto"
      />
      <div className='mb-40 flex flex-col justify-between items-center'>
      <img
        src={error}
        className="mb-4 max-w-[300px] mx-auto"
      />
        <p>Desculpe, ocorreu um erro inesperado.</p>
        <div className='flex flex-col justify-between items-center'>
          <Link to="/">Go Home</Link></div>
        </div>
        

    </div>
  );
}
