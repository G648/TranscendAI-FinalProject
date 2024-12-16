import React from 'react'
import { FaFolder } from 'react-icons/fa';
import './truncate.css';


export default function OpensFolder({ textSubtitle, colorIcon, colorBackground, onClick }) {


  return (
    <button onClick={onClick}  className='rounded-[10px] h-[70%] flex-none ' style={{ backgroundColor: colorBackground }}>
      <div className="flex flex-row items-center gap-[10px] h-full max-w-[150px] border rounded-[10px] border-blackTrans">
        <FaFolder size={35} fill={colorIcon} style={{ marginLeft: '5%' }} />

        <div className="h-[70%] w-[70%] flex flex-row items-center" >
          <p className="text-[18px] font-roboto font-bold truncate-text" style={{ color: 'black' }}>{textSubtitle}</p>
        </div>
      </div>

    </button>
  )
}

