import React from 'react';
import { Paragraph } from '../Fonts/Fonts';

const InfoBox = (props) => {
  return (
    <div className="  md:w-[22%]  bg-greyLightTrans rounded-lg flex flex-col items-center md:items-start justify-evenly drop-shadow-xl border gap-4 md:p-4 " style={{height: props.height}}>
      {/* Container do título e ícone */}
      <div className="w-[150px] h-[100px]  md:w-[80%] flex flex-col items-center gap-2 overflow-y-clip flex-wrap p-2 md:!flex-row">
        <img src={props.icon} alt="ícone da box info" className="w-12 h-12" />
        <p className="font-inter text-black text-md">{props.title}</p>
      </div>

      {/* Container do número e descrição */}
      <div className="flex flex-col items-center w-[90%] md:!items-start">
        <p className="text-3xl md:text-4xl font-bold font-inter text-greyTrans">{props.number}</p>
        <Paragraph textParagraph={props.textBox} styles={'max-sm:hidden '} />
      </div>
    </div>
  );
};

export default InfoBox;
