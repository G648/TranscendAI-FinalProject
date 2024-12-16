import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Logo/Logo-dark.png';
import logoLight from '../assets/Logo/Logo-light.png';

import { UserContext } from '../contexts/UserContext';
import { emailSignIn } from '../firebase';
import OAuth from '../components/OAuth';

export default function LogIn() {
  const { currentUser, darkMode } = useContext(UserContext);
  const nav = useNavigate();

  const [toggleActive, setToggleActive] = useState(false); // Estado para o toggle

  // Função para alternar o estado
  const handleToggleClick = () => {
    setToggleActive(!toggleActive);
  };

  const { handleSubmit } = useForm();
  const onSubmit = async (data) => {
    await emailSignIn(data);
  };
  const onError = (errors, e) => console.log(errors, e);



  useEffect(() => {
    if (currentUser) nav('/');
  }, [currentUser, nav]);


  return (
    <div
      id="LogIn"
      className="flex w-full flex-col gap-8 rounded-xl p-6 xs:m-auto xs:max-w-md xs:p-12 xs:outline xs:outline-1 xs:outline-[#F66E00]"
    >
      <div id="form-header" className="flex flex-col justify-center items-center gap-4">
        <img
          src={darkMode ? logoLight : logo}
          alt="devchallenges logo"
          className="mb-4 max-w-[300px] mx-auto"
        />

        <p className="text-[38px] font-medium text-black">Login</p>
      </div>

      <OAuth />
    </div>
  );
}
