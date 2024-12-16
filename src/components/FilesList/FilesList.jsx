import React from 'react';
import { Paragraph, ParagraphOrange, ParagraphTranscrito, SubTitle } from '../Fonts/Fonts';
import NotFiles from '../NotFiles/NotFiles';
import './scroll.css';

function formatDate(isoDate) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function FilesList({ openModal, filesData, height, filterBy }) {
  return (
    <section
      className="w-[360px] surface:w-[500px] lg:w-[1150px] bg-greyLightTrans border rounded-[10px] drop-shadow-xl p-4"
      style={{ height: height }}
    >
      <div className="md:overflow-x-auto overflow-y-auto md:max-h-full max-h-none custom-scrollbar sm:overflow-visible">
        {filesData.length === 0 ? (
          <NotFiles /> // Exibe componente quando não há arquivos
        ) : (
          <table className="table-auto w-full border-collapse">
            {/* Cabeçalho da Tabela */}
            <thead>
              <tr className="sticky top-0 bg-greyLightTrans text-xs sm:text-sm md:text-base">
                <th className="p-2 text-center">Nome do Arquivo</th>
                <th className="p-2 text-center hidden md:table-cell">
                  {filesData.some((file) => file.duration) ? 'Duração do Arquivo' : 'Tamanho do Arquivo'}
                </th>
                <th
                  className={`${
                    filterBy === 'Video' ? 'text-orangeTrans' : filterBy === 'Audio' ? 'text-orangeTrans' : ''
                  } p-2 text-center`}
                >
                  {filterBy === 'Audio' ? 'Áudio' : filterBy === 'Video' ? 'Vídeo' : 'Extensões do Arquivo'}
                </th>
                <th className="p-2 text-center hidden sm:table-cell">Data de Envio</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Ações</th>
              </tr>
            </thead>
            {/* Corpo da Tabela */}
            <tbody>
              {filesData.map((file, index) => (
                <tr key={index} className="border-b border-white bg-greyLightTrans">
                  <td className="py-2 text-center">
                    <Paragraph textParagraph={file.fileName.replace(/\.[^/.]+$/, '')} />
                  </td>
                  <td className="py-2 text-center hidden md:table-cell">
                    <Paragraph textParagraph={file.duration || file.fileSize} />
                  </td>
                  <td className="py-2 text-center">
                    <Paragraph
                      styles={`$${
                        filterBy === 'Video'
                          ? 'text-orangeTrans'
                          : filterBy === 'Audio'
                          ? 'text-orangeTrans'
                          : ''
                      }`}
                      textParagraph={file.fileType}
                    />
                  </td>
                  <td className="py-2 text-center hidden sm:table-cell">
                    <Paragraph textParagraph={formatDate(file.createdAt)} />
                  </td>
                  <td className="py-2 text-center">
                    <ParagraphTranscrito textParagraph={file.status} />
                  </td>
                  <td className="py-2 text-center">
                    <button onClick={() => openModal(file)}>
                      <ParagraphOrange textParagraph="Detalhes" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
