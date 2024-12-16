import React, { useEffect, useState } from 'react';
import Logo from '../../assets/Logo/Logo-light.png';
import Search from '../../assets/Icons/Icon-Search.svg';
import { GoFilter } from 'react-icons/go';

import { Paragraph, Title } from '../Fonts/Fonts';
import '../input/style.css';

import { createPortal } from 'react-dom';
import Line from '../Line/Line';

function DropDownFilterBy({
  setIsDropDownFilterBy,
  filterBy,
  setFilterBy,
  setFilterStatusBy,
  filterStatusBy,
}) {
  // const [status, setStatus] = useState("")

  useEffect(() => {
    const closeDropDown = (e) => {
      if (!e.target.closest('.dropdown-filter')) {
        setIsDropDownFilterBy(false);
      }
    };
    window.addEventListener('click', closeDropDown);

    return () => {
      window.removeEventListener('click', closeDropDown);
    };
  }, [setIsDropDownFilterBy]);

  const dropdownContent = (
    <div
      className="dropdown-filter absolute left-[65%] max-sm:left-[45%] top-20 w-[210px] max-sm:w-56 border rounded p-2 flex flex-col gap-3 bg-[#EEEEEE] z-50 drop-shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <Title styles="text-md" textTitle={'Filtrar por:'} />
      <div className="flex flex-col items-center m-2 gap-2">
        <button
          className={`flex flex-row items-center gap-2 hover:bg-slate-300 w-[80%] justify-center rounded-lg ${!filterBy ? 'bg-blue-200' : ''
            }`}
          onClick={() => {
            setFilterStatusBy(''), setFilterBy('');
          }}
        >
          <Paragraph textParagraph={'Nenhum'} />
        </button>
        <Line />
        <button
          className={`flex flex-row items-center gap-2 hover:bg-slate-300 w-[80%] justify-center rounded-lg ${filterStatusBy === 'Pendente'
            ? 'bg-blue-200'
            : filterStatusBy === 'Transcrito'
              ? 'bg-green-200'
              : ''
            }`}
          onClick={() => {
            setFilterStatusBy('Pendente'),
              filterStatusBy === 'Pendente' ? setFilterStatusBy('Transcrito') : setFilterStatusBy('Pendente');
          }}
        >
          <Paragraph textParagraph={'Status'} />
        </button>
        <Line />
        <button
          className={`flex flex-row items-center gap-2 hover:bg-slate-300 w-[90%] justify-center rounded-lg ${filterBy === 'Audio' ? 'bg-blue-200' : filterBy === 'Video' ? 'bg-blue-200' : ''
            }`}
          onClick={() => {
            setFilterBy('Audio'), filterBy === 'Audio' ? setFilterBy('Video') : setFilterBy('Audio');
          }}
        >
          <Paragraph
            textParagraph={`${filterBy === 'Audio' ? 'Audio' : filterBy === 'Video' ? 'Vídeo' : 'Tipo de Arquivo'
              }`}
          />
        </button>
      </div>
    </div>
  );

  return createPortal(dropdownContent, document.body);
}

export const InputSearch = ({
  setFilterBy, // Setar um filtro de arquivo
  filterBy,// Objeto de um arquivo 
  setFilterStatusBy, // setar por status
  filterStatusBy, // Filter objeto
  setIsDropDownProfilePictureOpen,
  setIsDropDownNotifyOpen,
  setIsDropDownFilterByOpen,
  isDropDownFilterByOpen,
  setKeyWords, // Setar objeto por palavra chave
  keyWords, // Obejto da palavra chave
  searchKeyWord, //Funçaõ de buscar por palavra chave
  generateHomeFilers //Funçaõ gerar dados na home
}) => {


  //Aqui é uma função para aparecer um "Modal" de notificação -> essa função só será aplicada em futuras branches
  const handleEmotionFilter = (e) => {
    e.stopPropagation();
    setIsDropDownFilterByOpen((prev) => !prev);

    setIsDropDownProfilePictureOpen(false);
    setIsDropDownNotifyOpen(false);
  };



  return (
    <div className="flex flex-row justify-between items-center w-full sm:w-[80%] md:w-[70%] bg-[#EEEEEE] gap-2 p-3 rounded-full drop-shadow-xl border border-[#504949]">
      <div className="flex flex-row gap-4 sm:gap-6 md:gap-8 w-full items-center">
        <img className="w-5 h-5 sm:w-6 sm:h-6" src={Search} alt="Search Icon" />
        <input
          onKeyDown={(e) => {
            if (e.key === "Enter" && keyWords && keyWords !== '') {
              searchKeyWord(); // Executa a função de busca
            }else{
              generateHomeFilers() //Quando o usuário aperta "Enter" e keyWord estiver vázia ele automáticamente irá gerar os dados na home
            }
          }}
          onChange={(e) => {setKeyWords(e.target.value), e.target.classList.add('expanded-input'),e.target.classList.add('active-placeholder');}}
          className="bg-[#EEEEEE] text-black outline-none w-full text-[14px] sm:text-sm md:text-base placeholder:italic placeholder:font-inter placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base transition-all duration-300"
          placeholder="Pesquise a palavra chave"
          onFocus={(e) => { //Aqui é uam questão de estilo só, quando o input é precionado o placeholder irá ficar maior
            e.target.classList.add('active-placeholder');
            e.target.classList.add('expanded-input');
          }}
          onBlur={(e) => {
            e.target.classList.remove('active-placeholder');
            e.target.classList.remove('expanded-input');
          }}
        />
      </div>

      <button
        className={`relative flex z-20 transition-transform duration-500 ease-in-out ${isDropDownFilterByOpen ? 'scale-150' : 'scale-100'
          }`}
        type="button"
        onClick={handleEmotionFilter}
      >
        <GoFilter fill="#F66E00" className="w-5 h-5 sm:w-6 sm:h-6 object-cover" alt="Filter Icon" />

        {isDropDownFilterByOpen && (
          <DropDownFilterBy
            setFilterBy={setFilterBy}
            filterBy={filterBy}
            setIsDropDownFilterBy={setIsDropDownFilterByOpen}
            setFilterStatusBy={setFilterStatusBy}
            filterStatusBy={filterStatusBy}
          />
        )}
      </button>
    </div>
  );
};

// INPUT MENOR PARA OS MODAIS

export const InputSearchModal = ({ styles = '', ...props }) => {




  return (
    <div
      className={`flex flex-row justify-between items-center bg-none h-[40px] w-[100%] bg-[#F9F9F9] gap-2 p-3 rounded-full drop-shadow-xl border md:h-[40px] md:w-[100%] ${styles}`}
    >
      <div className="flex flex-row gap-2 md:gap-8 w-full">
        <img className="w-6 h-6" src={Search} alt="Search Icon" />
        <input
          className="bg-[#F9F9F9] text-black outline-none w-[92%] placeholder:text-[10px] surface:placeholder:text-[16px]  md:placeholder:text-[16px]"
          placeholder="Pesquise a palavra chave"
          {...props}
        />
      </div>
    </div>
  );
};
