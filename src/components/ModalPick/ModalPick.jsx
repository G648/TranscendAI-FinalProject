import React, { useState, useEffect } from 'react';
import { FaFolder } from 'react-icons/fa';
import { Title } from '../Fonts/Fonts';
import api, { getAllFolders } from '../../Services/Service';

function Modal({ isOpen, onClose, onFoldersSelected }) {
    const [filesData, setFilesData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFolder, setSelectedFolder] = useState(null); // Estado para a pasta selecionada
    const [selectFolderId, setSelectFolderId] = useState("")

    // console.log("Pasta selecionada: ", selectFolderId);

    useEffect(() => {
        if (isOpen) {
            api.get(getAllFolders)
                .then(response => {
                    setFilesData(response.data.folders);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Erro ao listar arquivos:', error);
                    setLoading(false);
                });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFolderSelect = (folderName, folderId) => {
        setSelectedFolder(prevSelected => (prevSelected === folderName ? null : folderName));

        setSelectFolderId(folderId)
    };

    const handleLoadFolder = () => {
        console.log("carregouuuu", selectFolderId, selectedFolder)
        console.log(`Pasta carregada: ${selectedFolder}`);
        onFoldersSelected({ folderName: selectedFolder, folderId: selectFolderId }); // Passa a pasta para o componente pai
        onClose(); // Fecha a modal
    };

    return (
        <div className=" fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg relative md:h-[600px] md:w-[900px] h-[600px] w-[345px] surface:w-[500px] surface:h-[650px]">
                {/* Botão de fechar */}
                <button onClick={onClose} className="absolute top-2 right-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-full w-8 h-8 flex justify-center items-center">
                    ✕
                </button>

                {/* Conteúdo da modal */}
                <div className="p-4">
                    {loading ? (
                        <p>Carregando...</p>
                    ) : (
                        <div classname="md:max-h-[580px] " >
                            <Title textTitle={'Arquivos e Pastas'} />

                            {/* Pastas */}
                            <div className="mt-4" >

                                <Title textTitle={'Pastas:'} />
                                <ul
                                    className='custom-scrollbar'
                                    style={{
                                        columnCount: 3,
                                        columnGap: '1rem', // Espaço entre colunas
                                        maxHeight: '400px',
                                        overflowY: 'auto', // Barra de rolagem vertical
                                        padding: '0 10px', // Espaçamento interno
                                        boxSizing: 'border-box', // Inclui bordas no tamanho total
                                        marginTop: '20px',
                                    }}>
                                    {filesData?.Folders && Object.entries(filesData.Folders).map(([folderName, folderId]) => (
                                        <li
                                            key={folderId}
                                            className={`flex w-[85%] items-center gap-2 rounded-[5px] h-[50px] w-[90px] surface:w-[130px] md:w-[200px] cursor-pointer ${selectedFolder === folderName ? 'bg-gray-300' : ''}`}
                                            style={{
                                                border: '1px solid gray',
                                                marginBottom: '20px', // Espaço entre itens
                                                breakInside: 'avoid', // Impede quebra de itens entre colunas
                                            }}
                                            onClick={() => handleFolderSelect(folderName, folderId)} // Seleciona ou desseleciona a pasta
                                        >
                                            <FaFolder size={35} fill={'gray'} style={{ marginLeft: '5%' }} className='hidden md:block surface:block' />
                                            <div
                                                className="h-[90%] w-[90%] flex flex-row items-center overflow-hidden  "
                                            >
                                                <p className="p-[5px] md:pl-[0px] md:text-[18px] surface:text-[13px] text-[13px]" style={{ color: 'gray' }}>{folderName}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Botão carregar pasta */}
                            {selectedFolder && (
                                <div className="mt-4 flex justify-center">
                                    <button onClick={handleLoadFolder} className="bg-orangeTrans text-white px-4 h-[50px] font-inter rounded-[8px] py-2 rounded hover:bg-orange-600">
                                        Carregar pasta
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );

}

export default Modal;
