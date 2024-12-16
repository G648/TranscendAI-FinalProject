import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sad from '../../assets/Icons/Sad.svg';
import Danger from '../../assets/Icons/Danger.svg';

export default function PostNotification({ Emotion }) {
  const [emotionText, setEmotionText] = useState('');
  const [emotionIcon, setEmotionIcon] = useState('');

  function EmotionPost() {
    if (Emotion === 'Agressivo') {
      setEmotionText("Foi identificado um possível tom de irritação na transcrição do áudio do cliente. Revise a conversa para mais detalhes.");
      setEmotionIcon(Sad);
    } else {
      setEmotionText("Detectamos uma mistura de emoções na transcrição do áudio do cliente, como possíveis sentimentos de irritação e insatisfação.");
      setEmotionIcon(Danger);
    }
  }

  useEffect(() => {
    EmotionPost();
  }, [Emotion]);

  return (
    <section className='w-[100%] bg-white bg-opacity-50 rounded-xl drop-shadow-2xl p-3 border'>
      <div className='flex flex-row gap-2'>
        <img src={emotionIcon} className='w-8 h-8' alt="Emotion Icon" />
        <p className='text-start font-medium font-roboto text-xs text-[#383838]'>
          {emotionText}
        </p>
      </div>
      <div className='flex justify-end w-full'>
        <Link className="text-[#FA7B3B] text-xs">Ver Detalhes</Link>
      </div>
    </section>
  );
}