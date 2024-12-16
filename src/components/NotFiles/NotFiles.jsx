import React from 'react'
import { Paragraph, SubTitle } from '../Fonts/Fonts'
import NotFilesIcon from '../../assets/Icons/NoFilescuate.png'

export default function NotFiles() {
    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems:'center', justifyContent: 'center', width: '100%', height:'190px', marginTop:'2%'}}>
            
            <Paragraph textParagraph={'A pasta não possui arquivos'} styles="absolute mb-40"/>
            <img src={NotFilesIcon} alt="imagem ilustra que a pasta nao possui nenhum arquivo" className="h-[100%]"/>
        </div>
    )
}
