import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Header from '../components/Header';
import InfoBox from '../components/InfoBox/InfoBox';
import Menu_Bar from '../components/menuBar/MenuBar';
import FilesList from '../components/FilesList/FilesList';
import { Title } from '../components/Fonts/Fonts';
import Transcricao from '../assets/Icons/Transcricoes.svg';
import Video from '../assets/Icons/VideoIcon.svg';
import Audio from '../assets/Icons/AudioIcon.svg';
import ModalAudio from '../components/ModalAudio/ModalAudio';
import ModalPick from '../components/ModalPick/ModalPick';
import Folder from '../assets/Icons/PastaAmarela.svg';
import FileLoad from '../components/FileLoad/FileLoad';
import OpensFolder from '../components/OpensFolder/OpensFolder';
import SelectFile from '../components/SelectFile/SelectFile';
import { FaTrash } from 'react-icons/fa';
import api, {
  deleteFolders,
  getAllFilesFolderId,
  getFoldersSave,
  getTranscriptions,
  postFoldersSave,
  postSearchKeywords,
  postTranscriptionFilesFolderId,
  getFilesStatus
} from '../Services/Service';

export default function Home() {
  const { currentUser } = useContext(UserContext);
  const nav = useNavigate();

  const [selectedFile, setSelectedFile] = useState([]);
  const [isClicked, setIsClicked] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedFolder, setClickedFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [filesLoad, setFilesLoad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalPickOpen, setIsModalPickOpen] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [folderIds, setFolderIds] = useState([])
  const [pendingCount, setPendingCount] = useState(0);



  const openModalPick = () => setIsModalPickOpen(true);
  const closeModalPick = () => setIsModalPickOpen(false);

  //FilterInput
  const [filterBy, setFilterBy] = useState('');
  const [filterStatusBy, setFilterStatusBy] = useState('');
  const [keyWords, setKeyWords] = useState('');
  const [time, setTime] = useState([]);

  //Função de filtrar por pesquisa por palavra geral

  const searchKeyWord = () => {
    api
      .post(postSearchKeywords, [keyWords])
      .then((response) => {
        // Filtrar apenas um item por fileId (único arquivo por ID)
        const uniqueFiles = response.data.reduce((acc, current) => {

          if (isClicked === 'star') {
            if (
              !acc.some(
                (item) =>
                  item.fileId === current.fileId && ((item.favorito === true) === current.favorito) === true,
              )
            ) {
              acc.push(current);
            }
          } else if (isClicked === 'pasta') {
            if (!acc.some((item) => item.fileId === current.fileId && item.folderId === current.folderId)) {
              acc.push(current);

            }
          } else {
            if (!acc.some((item) => item.fileId === current.fileId)) {
              acc.push(current);
            }
          }

          return acc;
        }, []);

        // Agrupar os tempos (startTime) por fileId de forma semelhante ao uniqueFiles
        // const timesByFileId = response.data.map((e) => e);

        console.log('Arquivo único:', JSON.stringify(uniqueFiles, null, 2));

        // Atualizar estados
        setFilesData(uniqueFiles); // Atualiza com arquivos únicos
        setTime(response.data); // Atualiza com tempos agrupados
      })
      .catch((error) => console.error(error));
  };

  const filterList = () => {
    if (isClicked === 'home') {
      // +============== FILTRO DO VISÃO GERAL ==============+
      if (!filterBy && !filterStatusBy) return filesData; // Retorna todos os arquivos se nenhum filtro for aplicado.

      return filesData.filter((file) => {
        const matchesStatus = filterStatusBy ? file.status === filterStatusBy : true; // Filtro de status
        const matchesType = filterBy
          ? filterBy === 'Audio'
            ? ['.flac', '.mp3', '.ogg', '.wav'].includes(file.fileType)
            : filterBy === 'Video'
            ? ['.mp4'].includes(file.fileType)
            : true
          : true;

        return matchesStatus && matchesType;
      });
    } else if (isClicked === 'star') {
      // +============== FILTRO DO FAVORITOS ==============+
      if (!filterBy && !filterStatusBy) return filesData.filter((file) => file.favorito); // Retorna apenas os favoritos.

      return filesData.filter((file) => {
        const matchesStatus = filterStatusBy ? file.status === filterStatusBy && file.favorito : true;
        const matchesType = filterBy
          ? filterBy === 'Audio'
            ? ['.flac', '.mp3', '.ogg', '.wav'].includes(file.fileType) && file.favorito
            : filterBy === 'Video'
            ? ['.mp4'].includes(file.fileType) && file.favorito
            : true
          : true;

        return matchesStatus && matchesType;
      });
    } else if (isClicked === 'pasta') {
      // +============== FILTRO POR PASTA =================+
      if (!filterBy && !filterStatusBy) return filesLoad; // Retorna todos os arquivos se nenhum filtro for aplicado.

      return filesLoad.filter((file) => {
        const matchesStatus = filterStatusBy ? file.status === filterStatusBy : true;
        const matchesType = filterBy
          ? filterBy === 'Audio'
            ? ['.flac', '.mp3', '.ogg', '.wav'].includes(file.fileType)
            : filterBy === 'Video'
            ? ['.mp4'].includes(file.fileType)
            : true
          : true;

        return matchesStatus && matchesType;
      });
    }
  };

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const handleFolderClick = (folderId) => {
    setClickedFolder(clickedFolder === folderId ? null : folderId);
  };

  const handleFoldersSelected = (selectedFolder) => {
    saveFolder(selectedFolder); // Salva a pasta no banco e atualiza a lista
  };

  //Array dos dados
  const [filesData, setFilesData] = useState([]);

  const filteredFiles = clickedFolder
    ? filesData.filter((file) => file.folderId === clickedFolder)
    : filesData;

  const openModal = (file) => {
    setSelectedFile([file]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedFile([]);
    setIsModalOpen(false);
  };

  const toggleFavorite = (id) => {
    setFilesData((prevData) => {
      const updatedData = prevData.map((file) =>
        file.id === id ? { ...file, favorito: !file.favorito } : file,
      );
      return updatedData;
    });
  };

  function generateHomeFilers() {
    api
      .get(getTranscriptions)
      .then((response) => {
        setFilesData(response.data);
      })
      .catch((error) => {
        console.log('Erro ao listar :', error);
        setLoading(false);
      });
  }

  useEffect(() => {
    if (clickedFolder) {
      api
        .get(getAllFilesFolderId + clickedFolder.folderId)
        .then((response) => {
  
          // Ajusta os arquivos para usar a extensão do fileName
          const adjustedFiles = response.data.files.map((file) => ({
            ...file,
            fileType: `.${file.fileName.split('.').pop()}`, // Pega a extensão do fileName
          }));
  
          setFilesLoad(adjustedFiles);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Erro ao listar arquivos:', error);
          setLoading(false);
        });
    }
  }, [clickedFolder]);

  const transcriptFiles = async () => {
    try {
      if (!clickedFolder || !clickedFolder.folderId) {
        console.error('clickedFolder ou folderId não está definido.');
        return;
      }

      // Faz a requisição com o folderId em um objeto
      const response = await api.post(postTranscriptionFilesFolderId + clickedFolder.folderId);

      console.log('Arquivo transcrito com sucesso:', response.data);
    } catch (error) {
      if (error.response) {
        console.error('Erro do servidor:', error.response.data);
        console.error('Status do erro:', error.response.status);
      } else if (error.request) {
        console.error('Nenhuma resposta do servidor:', error.request);
      } else {
        console.error('Erro na configuração da requisição:', error.message);
      }
      console.log('Erro ao transcrever arquivos.');
    }
  };

  // Salva uma nova pasta no banco de dados e Transcrever os arquivos dentro
  const saveFolder = async (folder) => {
    try {
      const response = await api.post(postFoldersSave, folder);
      // Atualiza a lista de pastas após salvar
      fetchFolders();
      transcriptFiles();
    } catch (error) {
      console.error('Erro ao salvar a pasta:', error);
    }
  };

  // Busca as pastas salvas no banco de dados
  const fetchFolders = async () => {
    try {
      const response = await api.get(getFoldersSave);
      setFolders(response.data);
  
      const ids = response.data.map(folder => folder.folderId);
      setFolderIds(ids);
    } catch (error) {
      console.error('Erro ao carregar as pastas:', error);
    }
  };

  const fetchFilesFromFolders = async () => {
    try {
      // Mapeie os folderIds e monte a URL correta para cada chamada
      const requests = folderIds.map(id => api.get(`${getAllFilesFolderId}${id}`));
      
      // Execute todas as chamadas de forma paralela
      const responses = await Promise.all(requests);
    
      // Combine todos os arquivos retornados em um único array
      const allFiles = responses.flatMap(response => response.data.files);
  
      // Filtrar arquivos com status "Pendente"
      const pendingFiles = allFiles.filter(file => file.status === "Pendente");
      
      // Salvar a contagem no estado
      setPendingCount(pendingFiles.length);
  
      console.log('Quantidade de arquivos pendentes:', pendingFiles.length);
    } catch (error) {
      console.error('Erro ao carregar arquivos das pastas:', error);
    }
  };
  

  
  

  const fetchFavorites = async () => {
    try {
      const response = await api.get(getTranscriptions);
      const data = response.data;

      // Conta os favoritos com `favorito === true`
      const count = data.filter((item) => item.favorito === true).length;
      setFavoriteCount(count);
    } catch (error) {
      console.error('Erro ao buscar transcrições:', error);
    }
  };

  const deleteFolder = async (folderId) => {
    try {
      const response = await api.delete(deleteFolders + folderId);

      fetchFolders(); // Atualiza a lista de pastas após a exclusão
    } catch (error) {
      console.error('Erro ao excluir a pasta:', error);
    }
  };

  useEffect(() => {
    generateHomeFilers();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      nav('/Login');
    } else {
      fetchFolders(); // Carrega as pastas salvas no banco ao iniciar
      fetchFavorites();
      fetchFilesFromFolders();
    }
  }, [currentUser, nav]);

  return (
    <div id="Home" className="h-screen w-screen max-sm:h-auto max-md:h-auto flex flex-col md:flex-row sm:m-0">
      <section className="h-auto  w-full md:w-[20%] max-md:hidden">
        <Menu_Bar
          setIsClicked={setIsClicked}
          isClicked={isClicked}
          setSelectedFile={setSelectedFile}
          setIsModalPickOpen={setIsModalPickOpen}
        />
      </section>

      <div className=" md:mx-10 my-5 w-full md:w-[80%] h-auto gap-5 flex flex-col">
        <div className="w-full h-[8%] flex items-center">
          <Header
            setFilterBy={setFilterBy}
            filterBy={filterBy}
            setFilterStatusBy={setFilterStatusBy}
            filterStatusBy={filterStatusBy}
            setIsClicked={setIsClicked}
            isClicked={isClicked}
            setKeyWords={setKeyWords} // setando a palavra chave
            keyWords={keyWords} // objeto palavra chave
            searchKeyWord={searchKeyWord} // Função de pesquisar por palavra chave
            generateHomeFilers={generateHomeFilers} // Aqui eu levo a função de gerar dados da home para o Input
          />
        </div>

        {/********************************************* VISÃO GERAL ************************************/}
        {isClicked === 'home' ? (
          <div className=" w-full h-auto md:h-[88%] flex flex-col justify-between max-sm:justify-start max-md:justify-start overflow-clip max-md:items-center">
            {/* Infoboxes com overflow e layout responsivo */}
            <div className="flex flex-row flex-wrap max-sm:justify-center items-center gap-4 md:gap-6 max-sm:gap-10 surface:p-[5px] ">
              <InfoBox
                textBox="Arquivos pendentes"
                icon={Folder}
                title="Arquivo"
                number={pendingCount}
              />
              <InfoBox
                textBox="Arquivos transcritos"
                icon={Transcricao}
                title="Transcrição"
                number={`${filesData.filter((data) => data).length}`}
                styles={`md: sm:`}
              />
              {/* <InfoBox
                textBox="Vídeos transcritos"
                icon={Video}
                title="Vídeo"
                number={`${
                  filesData.filter((data) => data.type === '.mp4' && data.status === 'Transcrito').length
                }`}
              /> */}
              <InfoBox
                textBox="Áudios transcritos"
                icon={Audio}
                title="Áudio"
                number={`${
                  filesData.filter(
                    (data) =>
                      data.fileType === '.flac' ||
                      data.fileType === '.mp3' ||
                      data.fileType === '.ogg' ||
                      data.fileType === '.wav',
                  ).length
                }`}
              />
            </div>

            <ModalPick
              isOpen={isModalPickOpen}
              onClose={closeModalPick}
              onFoldersSelected={handleFoldersSelected}
            ></ModalPick>

            <div className="pr-2 pl-2 md:pr-0 md:pl-0 w-full ">
              <div className="mt-10 ">
                <Title
                  styles={
                    'font-semibold text-[16px] md:mb-8 md:mt-10 sm:text-[18px] md:text-[20px] lg:text-[22px]'
                  }
                  textTitle="Últimos arquivos transcritos"
                />
              </div>

              <div className='md:h-[240px] surface:h-auto  '>
                {/* Chamando a lista de arquivos */}
                <FilesList
                  openModal={(file) => openModal(file)} // Passe o arquivo completo
                  filesData={filterList()}
                  filterBy={filterBy}
                  toggleFavorite={toggleFavorite}
                  height="100%"
                  textParagraph="Você ainda não possui arquivos transcritos"
                />
              </div>
            </div>

            {/* Modal para exibir detalhes do arquivo qualquer coisa trocar para isModalOpen*/}
            {isModalOpen && selectedFile.length > 0 && (
              <ModalAudio
                keyWords={keyWords}
                file={selectedFile[0]}
                onClose={closeModal}
                toggleFavorite={toggleFavorite}
              />
            )}
          </div>
        ) : //ARQUIVOS E PASTAS *********************************
        isClicked === 'pasta' ? (
          <div className=" max-w-[335px] surface:max-w-[500px] lg:max-w-[1150px] md:mt-10 w-full h-[100%] md:h-[88%] flex flex-col max-sm:items-center pl-10 md:pl-0">
            {/* Título */}
            <div className="flex flex-row  items-center  ">
              <div className=" md:mb-10">
                <FileLoad setSelectedFile={setSelectedFile} openModalPick={openModalPick} />
              </div>
            </div>

            <ModalPick
              isOpen={isModalPickOpen}
              onClose={closeModalPick}
              onFoldersSelected={handleFoldersSelected}
            ></ModalPick>

            {/* Conteúdo Principal */}
            <div className="h-auto md:h-[90%] flex flex-col">
              {/* Seção de Pastas */}

              <div className="h-auto md:h-[25%] mt-2 flex flex-col gap-2 md:mb-10">
                <div className=" mt-6 mb-6 md:mb-0 flex flex-row h-[90%] w-[1150px] max-md:w-auto max-w-[335px] surface:max-w-[500px] lg:max-w-[1150px] overflow-x-auto custom-scrollbar gap-4 ">
                  {folders.map((folder, index) => (
                    <OpensFolder
                      key={folder.FolderId} // Use o ID único retornado pelo banco
                      textSubtitle={folder.folderName}
                      onClick={() => handleFolderClick(folder)}
                      colorIcon={clickedFolder === folder ? '#1e1e1e' : '#FF9D00'}
                      colorBackground={clickedFolder === folder ? '#FF9D00' : '#EEEEEE'}
                      colorText={clickedFolder === folder ? '#eeeeee' : '#383838'}
                    />
                  ))}
                </div>
              </div>

              {/* Seção de Arquivos */}
              <div className="h-full md:h-[250px] flex flex-col gap-3">
                {clickedFolder ? ( // Ajustado para verificar se uma pasta foi clicada
                  <>
                    <Title textTitle={`Arquivos da pasta: ${clickedFolder.folderName}`} />
                    <button onClick={() => deleteFolder(clickedFolder.folderId)} className="ml-auto mr-2">
                      <FaTrash size={20} color="red" />
                    </button>

                    
                    <FilesList
                      openModal={openModal}
                      filesData={filterList()}
                      isClicked={isClicked}
                      filterList={filterList}
                      toggleFavorite={toggleFavorite}
                      height="100%"

                    />
                    {isModalOpen && selectedFile.length > 0 && (
                      <ModalAudio
                        searchKeyWord={searchKeyWord} // Função de pesquisar por palavra chave
                        setKeyWords={setKeyWords} // setando a palavra chave
                        keyWords={keyWords} // objeto palavra chave
                        file={selectedFile[0]}
                        onClose={closeModal}
                        toggleFavorite={toggleFavorite}
                        height="100%"
                        textParagraph="A pasta não possui arquivos"
                        time={time}
                      />
                    )}
                  </>
                ) : (
                  <SelectFile />
                )}
              </div>
            </div>
          </div>
        ) : (  
        <div className="w-full h-auto md:h-[88%] flex flex-col justify-between max-sm:justify-start overflow-clip max-md:items-center">
          {/* Infoboxes responsivos */}
          <div className=" ">
            <InfoBox textBox="Arquivos Favoritos" icon={Folder} title="Favoritos" number={favoriteCount} />
          </div>

          <div className="pr-2 pl-2 md:pr-0 md:pl-0 w-full">
            <div className="mt-8">
              <Title
                styles={
                  'font-semibold text-[16px] md:mb-8 md:mt-10 sm:text-[18px] md:text-[20px] lg:text-[22px]'
                }
                textTitle="Minhas transcrições favoritas "
              />
            </div>

            <div className='sm:h-[240px] surface:h-auto '>
            <FilesList
                openModal={openModal}
                filesData={filterList()}
                toggleFavorite={toggleFavorite}
                height="100%"
                googleDriveFiles={selectedFile}
                textParagraph="Voce ainda nao possui arquivos favoritos"
              />
            </div>

          {/* Modal para exibir detalhes do arquivo qualquer coisa trocar para isModalOpen*/}
          {isModalOpen && selectedFile.length > 0 && (
            <ModalAudio
              keyWords={keyWords}
              file={selectedFile[0]}
              onClose={closeModal}
              toggleFavorite={toggleFavorite}
            />
          )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
