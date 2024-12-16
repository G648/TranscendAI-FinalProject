import React from 'react';

// Botão usado na parte notificação
export default function TinyButton (props){
    

    return (
        
        <button onClick={props.onClick} className={`${props.style} border-none text-[#383838] px-4 rounded-lg`}>
            <p className='font-roboto text-sm font-medium'> 
                {props.text}
            </p>
        </button>

        
    );
};

