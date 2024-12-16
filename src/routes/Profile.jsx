import { updateProfile } from 'firebase/auth';
import { nanoid } from 'nanoid';
import { string } from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import checkIcon from '../assets/Icons/checkIcon.svg';
import editIcon from '../assets/Icons/editIcon.svg';
import { UserContext } from '../contexts/UserContext';
import Logo from '../assets/Logo/Logo-light.png';
import iconExit from '../assets/Icons/logout.svg';
import { firebaseSignOut } from '../firebase';
import Line from '../components/Line/Line';
import { Paragraph, SubTitle, Title } from '../components/Fonts/Fonts';
import api, { getUserInfos } from '../Services/Service';

function ProfileRow({ rowName, rowVal }) {
  const { darkMode } = useContext(UserContext);
  const { register, handleSubmit } = useForm({
    defaultValues: { [rowName]: rowVal },
  });
  const [editing, setEditing] = useState(false);
  

  function edit() {
    setEditing(true);
    console.log(JSON.parse(localStorage.getItem('user')));
  }

  async function onSubmit(data) {
    setEditing(false);
    await updateProfile(auth.currentUser, { displayName: data.name });
    window.location.reload();
  }


  return (
    <tr>
      <td className="px-4 py-4 text-sm font-bold font-inter text-[#FA7B3B]">{rowName.toUpperCase()}</td>
      <td>
        <div className="flex justify-between items-center gap-8">
          <Paragraph textParagraph={rowVal} />
        </div>
      </td>
    </tr>
  );
}

export default function Profile() {
  const { currentUser } = useContext(UserContext);
  const nav = useNavigate();

  // Dados de Usuário
  const [ emailData, setEmailData] = useState('')
  const [ nameData, setNameData] = useState('')

  const getUserData = () => {
    api
      .get(getUserInfos)
      .then((response) => {
        console.log(`Dados de Ususairo ${response.data.name}`);
        setEmailData(response.data.email)
        setNameData(response.data.name)
      })
      .catch((error) => {
        console.log('Erros boi:' + error);
      });
  };

  useEffect(() => {
    getUserData();
  }, []);


  function handleClickLogOut(e) {
    e.stopPropagation();
    firebaseSignOut();
  }

  function handleClickLogo(e) {
    e.stopPropagation();
    nav('/');
  }

  const info = [
    ['nome', nameData || 'Não disponível'],
    // ['telefone', currentUser?.phoneNumber || 'Não disponível'],
    ['email', emailData || 'Não disponível'],
  ];

  const infoRows = info.map((row) => (
    <>
      <ProfileRow rowName={row[0]} rowVal={row[1]} key={nanoid()} />
      <tr>
        <td colSpan={2}>
          <Line />
        </td>
      </tr>
    </>
  ));

  useEffect(() => {
    if (!currentUser) nav('/login');
    console.log(currentUser);
  }, [currentUser, nav]);

  return (
    <div id="Profile" className="h-full w-[90%] mt-[2%]">
      <div className="flex flex-row justify-between items-center">
        <div className="w-[20%] h-[20%]">
          <img src={Logo} alt="" onClick={handleClickLogo} className=" cursor-pointer" />
        </div>
        <button
          type="button"
          onClick={handleClickLogOut}
          className="w-[5%] h-full flex flex-col items-center justify-center mr-[1%]"
        >
          <img src={iconExit} alt="icon de logout" />
          <p className="text-black">Logout</p>
        </button>
      </div>

      <div className="flex justify-center bg-[#eeeeee] h-[420px] mt-[3%] rounded-[6px]">
        <table className="mt-[1%] w-[90%] bg-[#eeeeee] h-[70%]">
          <colgroup>
            <col className="w-40" />
          </colgroup>
          <thead>
            <tr>
              <th colSpan={2}>
                <div className="p-4 flex items-start flex-col">
                  <Title textTitle={'Perfil'} />
                  <SubTitle textSubtitle={'Dados pessoais'} />
                  <div className="border-t border-black w-[100%] flex self-center justify-self-center" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="space-y-4">
            <tr>
              <td className="px-4 py-2 text-[20px] font-bold font-inter text-[#FA7B3B] ml-[10%]">
                Foto de perfil:
              </td>
              <td>
                <img
                  src={currentUser?.photoURL}
                  alt="Foto de perfil"
                  className="rounded-full object-cover w-24 h-24 mb-4"
                />
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <Line />
              </td>
            </tr>
            {infoRows}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ProfileRow.propTypes = {
  rowName: string.isRequired,
  rowVal: string,
};

ProfileRow.defaultProps = {
  rowVal: undefined,
};
