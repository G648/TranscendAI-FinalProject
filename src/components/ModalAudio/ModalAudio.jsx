import { IoCloseOutline } from 'react-icons/io5';
import { BsDownload } from 'react-icons/bs';
import { InputSearchModal } from '../input/Input';
import { Paragraph, ParagraphOrange, SubTitle } from '../Fonts/Fonts';
import { MdGTranslate } from 'react-icons/md';
import { RiSpeakLine } from 'react-icons/ri';
import '../ModalAudio/scroll.css';
import AudioPlayerComponent from '../AudioPlayer/AudioPlayer';
import VideoPlayerComponent from '../VideoPlayer/VideoPlayer';
import { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import jsPDF from 'jspdf';
import LogoFromPDF from '../../assets/Logo/Logo-light.png';
import api, {
  patchUnfavoriteFile,
  patchFavoriteFile,
  getTranscriptionsDetails,
} from '../../Services/Service';

export default function ModalAudio({
  time,
  handleDownload,
  file,
  onClose,
  toggleFavorite,
  dataFile,
  keyWords, //objeto palavra chave
  setKeyWords, // setando a palavra chave
  searchKeyWord, // Função de pesquisar por palavra chave
}) {
  const [isClicked, setIsClicked] = useState(file.favoritado);
  const [searchTerm, setSearchTerm] = useState('');
  const [d, setD] = useState([]);
  const [transcription, setTranscription] = useState('');
  const [times, setTimes] = useState('');

  if (!file) return null;

  const handleFavoriteClick = async () => {
    try {
      toggleFavorite(file.id);

      if (file.favorito) {
        // Desfavoritar
        await api.patch(`${patchUnfavoriteFile}${file.id}/unfavorite`);
        console.log('Desfavoritar', file.favorito);

        setIsClicked(false);
      } else {
        // Favoritar
        console.log('favoritando', file.favorito);
        await api.patch(`${patchFavoriteFile}${file.id}/favorite`);
        setIsClicked(true);
      }

      setIsClicked(!isClicked); // Atualiza o estado local
      console.log(file.id);

      // toggleFavorite(file.id);
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    }
  };

  const isAudioFile = (fileType) =>
    fileType === '.flac' || fileType === '.mp3' || fileType === '.ogg' || fileType === '.wav';
  const isVideoFile = (fileType) => fileType === '.mp4';

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    const currentDateTime = new Date().toLocaleString();
    doc.setFontSize(12);
    doc.text(`Download realizado em: ${currentDateTime}`, 60, 290);

    const logo = LogoFromPDF;
    const imgData = logo;
    doc.addImage(imgData, 'PNG', 40, 10, 120, 50);

  
    doc.setFontSize(16);
    doc.text('Transcrição', 10, 60);
    doc.setFontSize(12);
    doc.text(transcriptText, 10, 70, { maxWidth: 180 });

    doc.save(`transcricao_${currentDateTime.replace(/[\s:/]/g, '_')}.pdf`);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    console.log('pavra chave:', value);

    // try {

    //   const response = axios.get(`https://localhost:7220/Transcription/transcription-detail/${file.fileId}/${searchTerm}`)

    //   console.log(response.data);
    //   console.log("File ID:", file.fileId);
    //   console.log(searchTerm);

    // } catch (error) {
    //   console.log('error', error);

    // }
  };

  const highlightText = (text, term) => {
    if (!term.trim()) return text;

    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <span key={index} className="bg-yellow-300">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  const transcriptText = `${transcription}`;

  const getTranscription = async () => {
    try {
      const response = await api.get(getTranscriptionsDetails + file.fileId);

      // Atualiza a transcrição e keywords
      const transcriptedText = response.data.transcription;
      const wordKeywords = response.data.keywords || []; // Palavra-chave retornada pelo endpoint
      console.log('palavra chave', wordKeywords);
      console.log(file.fileId);

      setTranscription(transcriptedText || 'Transcrição indisponível.');
      if (keyWords !== '') {
        setSearchTerm(keyWords); // Define o termo de busca inicial
        if (keyWords === searchTerm) {
          console.log('Pesquisando por palavra chave no input do modal ');
          // filterTimes(wordKeywords, searchTerm);

          setD(file);
          setTimes('');
          setSearchTerm('');
          handleSearchChange;
        } else {
          console.log('Pesquisando por palavra-chave');
          filterTimes(wordKeywords, keyWords); // Atualiza tempos com a palavra-chave inicial
        }
      } else {
        console.log('Pesquisando no visão geral');
        // handleSearchChange; // Chama a função para busca geral
        setD(wordKeywords);
        filterTimes(wordKeywords, searchTerm);
      }
    } catch (error) {
      console.error('Erro ao carregar a transcrição:', error);
    }
  };

  // Filtrar tempos com base no termo de busca
  const filterTimes = (wordList, term) => {
    if (!wordList || !term) return;

    // Filtra os tempos que correspondem à palavra-chave
    const filteredTimes = wordList.filter((entry) => entry.keyword.toLowerCase() === term.toLowerCase());

    console.log('Tempos filtrados por palavra chave:', filteredTimes);
    setTimes(filteredTimes);
  };

  // Atualiza os tempos sempre que o termo de busca mudar
  useEffect(() => {
    if (transcription && file?.wordTimestamps) {
      filterTimes(file.wordTimestamps, searchTerm);
    }
  }, [searchTerm, file?.wordTimestamps, transcription]);

  // Carrega a transcrição ao abrir o modal
  useEffect(() => {
    getTranscription();
  }, []);

  useEffect(() => {
    if (d.length > 0 && searchTerm) {
      filterTimes(d, searchTerm);
    }
  }, [searchTerm, d]); // Reexecuta quando o termo de busca ou keywords mudam

  return (
    <section className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-greyLightTrans p-4 rounded-lg mx-4 w-[95%] h-[95%] sm:w-[90%] sm:h-[90%] md:w-[80%] md:h-[80%] ml-1">
        {/* HEADER MODAL */}
        <section className="flex flex-row gap-[10px] md:gap-[30px] justify-between">
          <div className="flex gap-[15px] items-center">
            <button
              className="flex items-center"
              type="button"
              onClick={() => {
                handleFavoriteClick();
              }}
            >
              <FaStar size="30px" fill={isClicked === true ? '#FF9D00' : '#A0A0A0'} />
            </button>

            <button onClick={handleGeneratePDF}>
              <BsDownload size={32} color="#FA7B3B" />
            </button>
          </div>

          <div className="flex w-[100%] sm:w-auto md:w-auto justify-end gap-[10px] sm:gap-[20px] md:gap-[30px] items-center">
            <InputSearchModal styles={'sm: w-[90%]'} value={searchTerm} onChange={handleSearchChange} />
            <button
              onClick={() => {
                onClose(), setSearchTerm('');
              }}
            >
              <IoCloseOutline size={40} color="#FA7B3B" />
            </button>
          </div>
        </section>

        {/* CONTEÚDO PRINCIPAL DO MODAL */}
        <section className="flex flex-col sm:flex-row h-[90%] gap-4 mt-4 overflow-y-auto md:overflow-y-hidden">
          {/* Transcrição - Lado Esquerdo */}
          <div className="flex flex-col w-full sm:w-[60%]">
            <div className="flex flex-row justify-between mb-4">
              <SubTitle textSubtitle={'Transcrição'} />
              {/* <div className="flex flex-row gap-[15px] sm:gap-[25px]">
                <a href="#" onClick={(e) => e.preventDefault()}>
                  <RiSpeakLine size={20} color="#383838" />
                </a>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  <MdGTranslate size={20} color="#383838" />
                </a>
              </div> */}
            </div>

            {/* Texto de transcrição */}
            <div className="w-full h-[90%] bg-whiteTrans shadow-xl border rounded-[10px] flex justify-center items-center">
              <div className="w-[90%] h-auto md:h-[90%] mt-3 mb-3 md:mt-0 md:mb-0 p-[20px] md:overflow-y-auto custom-scrollbar">
                {highlightText(transcriptText, searchTerm)}
              </div>
            </div>
          </div>

          {/* Dados da transcrição - Lado Direito */}
          <div className="w-full sm:w-[40%] md:mt-[70px] flex flex-col bg-greyLightTrans">
            <div className="w-full sm:w-[380px] max-h-[150px] pr-[5px] custom-scrollbar overflow-x-auto break-words">
              <ParagraphOrange textParagraph={'Minuto da palavra-chave encontrada:'} />
              {times.length > 0 ? (
                times.map((item, index) => (
                  <Paragraph key={index} className="break-words" textParagraph={`${item.startTime}`} />
                ))
              ) : (
                <Paragraph textParagraph="Nenhuma palavra-chave encontrada." />
              )}
            </div>
            <div className="mt-[10px]">
              <ParagraphOrange textParagraph={'Filtrando por:'} />
              <Paragraph textParagraph={`${searchTerm}`} />
            </div>
            {isAudioFile(file.fileType) ? (
              <>
                {/* {console.log('ID do arquivo carregado:', file.fileId)}
                {console.log('URL do arquivo:', `https://drive.google.com/file/d/${file.fileId}/preview`)} */}
                <iframe
                  title="Google Drive Audio"
                  style={{
                    width: '100%',
                    height: '16rem', // Equivalente ao h-64
                    border: '2px solid #FA7B3B', // Exemplo de borda
                    borderRadius: '10px', // Exemplo de borda arredondada
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Exemplo de sombra
                  }}
                  // className="w-full h-64 sm:h-96"
                  src={`https://drive.google.com/file/d/${file.fileId}/preview`}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                ></iframe>
              </>
            ) : isVideoFile(file.fileType) ? (
              <>
                <iframe
                  title="Google Drive Video"
                  className="w-full h-64 sm:h-96"
                  src={`https://drive.google.com/file/d/${file.fileId}/preview`}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                ></iframe>
              </>
            ) : (
              <Paragraph textParagraph={'Tipo de arquivo não suportado'} />
            )}{' '}
            {/* {isAudioFile(file.fileType) ? (
                <>
                  {console.log('ID do arquivo carregado:', file.fileId)}
                  {console.log('URL do arquivo:', `https://drive.google.com/file/d/${file.fileId}/preview`)}
                  <iframe
                    title="Google Drive Audio"
                    style={{
                      width: '100%',
                      height: '16rem', // Equivalente ao h-64
                      border: '2px solid #FA7B3B', // Exemplo de borda
                      borderRadius: '10px', // Exemplo de borda arredondada
                      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Exemplo de sombra
                    }}
                    // className="w-full h-64 sm:h-96"
                    src={`https://drive.google.com/file/d/${file.fileId}/preview`}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  ></iframe>
                </>
              ) : isVideoFile(file.fileType) ? (
                <>
                  <iframe
                    title="Google Drive Video"
                    className="w-full h-64 sm:h-96"
                    src={`https://drive.google.com/file/d/${file.fileId}/preview`}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  ></iframe>
                </>
              ) : (
                <Paragraph textParagraph={'Tipo de arquivo não suportado'} />
              )} */}
          </div>
        </section>
      </div>
    </section>
  );
}
