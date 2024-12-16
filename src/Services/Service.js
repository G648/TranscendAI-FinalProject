import axios from "axios";  

//Criação das constantes para rotas do backend
export const getAllFolders = '/Transcription/folders'
export const getAllFilesFolderId = "/Transcription/files-with-status/" 
export const postTranscriptionFilesFolderId = "/Transcription/schedule-monitor-and-transcribe/"
export const getTranscriptions = "/Transcription/transcriptions-with-status"
export const postSearchKeywords = "/Transcription/search-keywords"
export const postFoldersSave = "/Transcription/folders/save"
export const getFoldersSave = "/Transcription/folders/saved"
export const deleteFolders = "/Transcription/folders/delete/"
export const patchFavoriteFile = "/Transcription/transcriptions/"
export const patchUnfavoriteFile = "/Transcription/transcriptions/"
export const getFilesStatus = "/Transcription/files-status/" 
export const getTranscriptionsDetails = "/Transcription/transcription-detail/"
export const getUserInfos = "/Transcription/userinfo"

const externalUrlApi = `https://transcendaiwebapp.azurewebsites.net`

const api = axios.create({
    baseURL: externalUrlApi
})


export default api;