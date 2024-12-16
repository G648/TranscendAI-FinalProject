import React from 'react'
import SelectIcon from '../../assets/Icons/Select-amico.png'

export default function SelectFile() {
    return (
        <div className="h-full flex flex-col items-center ">

            <img src={SelectIcon} alt="imagem para selecionar um arquivo" className="h-[250px] mt-10" />

            <p className="text-black text-center">
                Selecione uma pasta para visualizar <br /> os arquivos transcritos
            </p>
        </div>

    )
}
