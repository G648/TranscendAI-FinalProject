import { Link, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { func } from 'prop-types';
import { UserContext } from '../contexts/UserContext';
import { firebaseSignOut } from '../firebase';
import { InputSearch } from './input/Input';
import { Title } from './Fonts/Fonts';
import TinyButton from './button/Button';
import PostNotification from './notification/Notification';
import '../components/FilesList/scroll.css';
import { RxHamburgerMenu } from 'react-icons/rx';
import Menu_Bar from './menuBar/MenuBar';
import { IoNotifications } from 'react-icons/io5';

//Dados mocadas de uma notificação
const notifications = [
  {
    id: 1,
    emocaoDoCliente: 'Agressivo',
    status: 'NotSeen',
    mensagem: 'Cliente relatou problema com a entrega.',
    data: '2024-09-18T10:30:00',
  },
  {
    id: 2,
    emocaoDoCliente: 'Confuso',
    status: 'Seen',
    mensagem: 'Cliente solicitou ajuda com o cadastro.',
    data: '2024-09-17T14:22:00',
  },
  {
    id: 3,
    emocaoDoCliente: 'Agressivo',
    status: 'Seen',
    mensagem: 'Cliente insatisfeito com o atendimento.',
    data: '2024-09-16T09:15:00',
  },
  {
    id: 4,
    emocaoDoCliente: 'Confuso',
    status: 'NotSeen',
    mensagem: 'Cliente precisa de informações sobre o pagamento.',
    data: '2024-09-15T11:45:00',
  },
  {
    id: 5,
    emocaoDoCliente: 'Agressivo',
    status: 'NotSeen',
    mensagem: 'Cliente reclama de produto com defeito.',
    data: '2024-09-14T13:55:00',
  },
  {
    id: 6,
    emocaoDoCliente: 'Confuso',
    status: 'Seen',
    mensagem: 'Cliente com dúvida sobre políticas de devolução.',
    data: '2024-09-13T16:20:00',
  },
];

//Função para descer a tela do perfil
function DropDownProfilePicture({ setIsDropDownProfilePictureOpen }) {
  const nav = useNavigate();

  function handleClickProfile(e) {
    e.stopPropagation();
    nav('/profile');
  }

  function handleClickLogOut(e) {
    e.stopPropagation();
    firebaseSignOut();
  }

  useEffect(() => {
    const closeDropDownProfilePicture = () => setIsDropDownProfilePictureOpen(false);
    window.addEventListener('click', closeDropDownProfilePicture);

    return () => {
      window.removeEventListener('click', closeDropDownProfilePicture);
    };
  }, []);

  return (
    <div className="absolute right-0 top-20 w-40 border-r-8 rounded p-2 flex flex-col gap-2 border bg-[#EEEEEE] z-50">
      <button
        type="button"
        onClick={handleClickProfile}
        className="flex items-center p-2 rounded gap-2 hover:bg-slate-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 fill-black"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-black">Meu Perfil</p>
      </button>
      <hr className="opacity-20" />
      <button
        type="button"
        onClick={handleClickLogOut}
        className="flex items-center p-2 rounded gap-2 hover:bg-slate-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 fill-red-500"
        >
          <path
            fillRule="evenodd"
            d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-black">Sair</p>
      </button>
    </div>
  );
}

// Função para descer a tela de notificação
// function DropDownNotify({ setIsDropDownNotify }) {
//   const [isClicked, setIsClicked] = useState('Não Lidos');

//   const filteredNotifications =
//     isClicked === 'Não Lidos'
//       ? notifications.filter((notification) => notification.status === 'NotSeen')
//       : notifications;

//   useEffect(() => {
//     const closeDropDownNotify = () => setIsDropDownNotify(false);
//     window.addEventListener('click', closeDropDownNotify);
//     return () => window.removeEventListener('click', closeDropDownNotify);
//   }, []);

//   return (
//     <div className="w-[340px] md:w-96 h-[400px] md:h-80 rounded p-2 flex flex-col gap-2 bg-[#EEEEEE] drop-shadow-2xl border absolute top-14 right-0 z-30">
//       <div className="position fixed z-30 bg-[#EEEEEE] w-[96%] p-2">
//         <Title textTitle={'Notificação'} />

//         <div className="flex justify-start gap-3 w-full ">
//           <TinyButton
//             onClick={(e) => {
//               e.stopPropagation();
//               setIsClicked('Não Lidos');
//             }}
//             text="Não Lido"
//             style={isClicked === 'Não Lidos' ? 'bg-[#FA7B3B]' : ''}
//           />
//           <TinyButton
//             onClick={(e) => {
//               e.stopPropagation();
//               setIsClicked('Todos');
//             }}
//             text="Todos"
//             style={isClicked === 'Todos' ? 'bg-[#FA7B3B]' : ''}
//           />
//         </div>
//       </div>

//       <section className="flex flex-col justify-start items-start gap-5 overflow-y-scroll bg-greyLightTrans custom-scrollbar p-3 mt-[73px]">
//         {/* Renderizar notificações filtradas */}
//         {filteredNotifications.map((notification) => (
//           <div className="flex flex-col h-full w-full bg-greyLightTrans">
//             <PostNotification key={notification.id} Emotion={notification.emocaoDoCliente} />
//           </div>
//         ))}
//       </section>
//     </div>
//   );
// }

export default function Header({
  setIsClicked,
  isClicked,
  setFilterBy,
  filterBy,
  setFilterStatusBy,
  filterStatusBy,
  setKeyWords,
  keyWords,
  searchKeyWord,
  generateHomeFilers // Função gerar na Home
}) {
  const { currentUser } = useContext(UserContext);

  //States para abris os dropdowns
  const [isDropDownProfilePictureOpen, setIsDropDownProfilePictureOpen] = useState(false);
  const [isDropDownNotifyOpen, setIsDropDownNotifyOpen] = useState(false);
  const [isDropDownFilterByOpen, setIsDropDownFilterByOpen] = useState(false);
  
  const [isMenuBarOpen, setIsMenuBarOpen] = useState(false); // Novo estado para o modal


  function handleClickDropDownProfilePicture(e) {
    e.stopPropagation();
    setIsDropDownProfilePictureOpen((prev) => !prev);
    // setIsDropDownNotifyOpen(false);
    setIsDropDownFilterByOpen(false)
  }

  // function handleClickDropDownNotify(e) {
  //   e.stopPropagation();
  //   setIsDropDownNotifyOpen((prev) => !prev);
  //   setIsDropDownProfilePictureOpen(false);
  //   setIsDropDownFilterByOpen(false)
  // }

  function handleHamburgerClick(e) {
    e.stopPropagation();
    setIsMenuBarOpen((prev) => !prev);
  }

  return (
    <header className="pr-4 pl-4 md:pr-0 md:pl-0 flex sm:flex-row items-center justify-between w-full">
      {/* ============ Mobile Menu-Burger ================== */}
      <button className="md:hidden" onClick={handleHamburgerClick}>
        <RxHamburgerMenu size={32} color="" />
      </button>
      {/* ================================================== */}

      <InputSearch
        filterBy={filterBy} // Objeto de um arquivo 
        setFilterBy={setFilterBy} // Setar um filtro de arquivo
        setFilterStatusBy={setFilterStatusBy} // setar por status
        filterStatusBy={filterStatusBy} // Filter objeto

        isDropDownFilterByOpen={isDropDownFilterByOpen}
        setIsDropDownFilterByOpen={setIsDropDownFilterByOpen}

        setKeyWords={setKeyWords} // Setar objeto por palavra chave
        keyWords={keyWords} // Obejto da palavra chave
        searchKeyWord={searchKeyWord} //Funçaõ de buscar por palavra chave
        generateHomeFilers={generateHomeFilers} //Função gerar dados na Home

        // setIsDropDownNotifyOpen={setIsDropDownNotifyOpen}
        // setIsDropDownProfilePictureOpen={setIsDropDownProfilePictureOpen}
      />

      {/* Noficação Button  */}
      <div className=" flex flex-row items-center gap-8 ">
        <div >
          {/* <button
            type="button"
            onClick={handleClickDropDownNotify}
            className={`relative flex tems-center p-2 z-10  transition-transform duration-200 ease-in-out ${
              isDropDownNotifyOpen ? 'scale-110' : 'scale-80'
            }`}
          >
            {notifications.filter((notification) => notification.status === 'NotSeen').length > 0 && (
              <div
                className={`absolute top-0 right-0 -mt-1 -mr-1 flex items-center justify-center rounded-full bg-orange-500 w-5 h-5 text-white text-xs font-bold z-20  transition-transform duration-200 ease-in-out ${
                  isDropDownNotifyOpen ? 'scale-102' : 'scale-100'
                }`}
                // z-index mais alto para contador
              >
                {notifications.filter((notification) => notification.status === 'NotSeen').length}
              </div>
            )}

            <IoNotifications size={30} alt="Notification Icon" />

            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />

            {isDropDownNotifyOpen && <DropDownNotify setIsDropDownNotify={setIsDropDownNotifyOpen} />}
          </button> */}
        </div>

        {/* Profile Button */}
        <button
          type="button"
          onClick={handleClickDropDownProfilePicture}
          className="relative flex gap-4 items-center p-2 max-md:hidden  "
        >
          <img
            src={currentUser?.photoURL}
            alt="User Profile"
            className="w-16 h-16 object-cover rounded-full"
          />

          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />

          {isDropDownProfilePictureOpen && (
            <DropDownProfilePicture setIsDropDownProfilePictureOpen={setIsDropDownProfilePictureOpen} />
          )}
        </button>
      </div>

      {/* Modal do Menu_Bar para Mobile */}
      {isMenuBarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-start items-center "
          onClick={() => setIsMenuBarOpen(false)}
        >
          <div className=" w-64 h-full shadow-lg p-4" onClick={(e) => e.stopPropagation()}>
            <Menu_Bar
              setIsMenuBarOpen={setIsMenuBarOpen}
              isMenuBarOpen={isMenuBarOpen}
              setIsClicked={setIsClicked}
              isClicked={isClicked}
            />
          </div>
        </div>
      )}
    </header>
  );
}

DropDownProfilePicture.propTypes = {
  setIsDropDownProfilePictureOpen: func.isRequired,
};
// DropDownNotify.propTypes = {
//   setIsDropDownNotify: func.isRequired,
// };
