import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo/Logo-dark.png';
import logoLight from '../../assets/Logo/Logo-light.png';
import ModalPick from '../ModalPick/ModalPick';

// HomeLogo
import { MdDashboard } from 'react-icons/md';
// PastaLogo
import { FaFolder } from 'react-icons/fa';

// StarLogo
import { FaStar } from 'react-icons/fa';
import { Paragraph } from '../Fonts/Fonts';
import { firebaseSignOut } from '../../firebase';
import FileLoad from '../FileLoad/FileLoad';

const Menu_Bar = ({ setIsClicked, isClicked, setIsMenuBarOpen, setSelectedFile, setIsModalPickOpen }) => {
  const nav = useNavigate();

  function handleClickProfile(e) {
    e.stopPropagation();
    nav('/profile');
  }

  function handleClickLogOut(e) {
    e.stopPropagation();
    firebaseSignOut();
  }

  const openModalPick = () => {
    setIsModalPickOpen(true);
    setIsMenuBarOpen(false);
    console.log('ASLKDASDLÇSAKD');
  };

  return (
    <div className="flex flex-col justify-between border bg-[#EEEEEE] w-full h-full rounded-xl drop-shadow-x">
      <aside className="flex flex-col gap-5 ">
        <img src={logoLight} alt="Imagem do logo" />
        {/* Tinha esse margin antes na section ml-7 */}
        <section className="  flex flex-col w-auto h-auto ">
          <button
            className={`flex flex-row items-center ${
              isClicked === 'home' ? 'border border-r-2 border-r-[#F66E00]' : ''
            } `}
            type="button"
            onClick={() => {
              setIsClicked('home'), setIsMenuBarOpen(false);
            }}
          >
            {isClicked === 'home' ? (
              <MdDashboard size={'37%'} fill="#F66E00" />
            ) : (
              <MdDashboard size={'37%'} fill="#D2D1D1" />
            )}

            <Paragraph textParagraph={'Visão Geral'} />
          </button>

          <button
            className={`flex flex-row items-center ${
              isClicked === 'pasta' ? 'border border-r-2 border-r-[#F66E00]' : ''
            } `}
            type="button"
            onClick={() => {
              setIsClicked('pasta'), setIsMenuBarOpen(false);
            }}
          >
            {isClicked === 'pasta' ? (
              <FaFolder size={'37%'} fill="#F66E00" />
            ) : (
              <FaFolder size={'37%'} fill="#D2D1D1" />
            )}
            <Paragraph textParagraph={'Arquivos e pastas'} />
          </button>

          <button
            className={`flex flex-row items-center ${
              isClicked === 'star' ? 'border border-r-2 border-r-[#F66E00]' : ''
            } `}
            type="button"
            onClick={() => {
              setIsClicked('star'), setIsMenuBarOpen(false);
            }}
          >
            {isClicked === 'star' ? (
              <FaStar size={'37%'} fill="#F66E00" />
            ) : (
              <FaStar size={'37%'} fill="#D2D1D1" />
            )}
            <Paragraph textParagraph={'Favoritos'} />
          </button>
        </section>

        {/******************MOBILE SECTION ***************************/}
        <section className=" md:hidden flex flex-row items-center justify-center ">
          <hr className="opacity-20 bg-black" />
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
        </section>
        {/* <div className="flex flex-col items-center mt-5 md:hidden">
          <FileLoad setSelectedFile={setSelectedFile} openModalPick={openModalPick} />
        </div> */}
      </aside>
    </div>
  );
};

export default Menu_Bar;
