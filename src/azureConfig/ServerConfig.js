import { Keys } from "./Keys";
import { BlobServiceClient } from "@azure/storage-blob";


export const CreateImageFile = async (file, onProgress) => {
    try {
      const validMediaTypes = ["audio", "video", "image"];
      const fileType = file.type.split("/")[0];
  
      if (!validMediaTypes.includes(fileType)) {
        throw new Error("Tipo de arquivo inválido. Apenas áudio, vídeo ou imagem são permitidos.");
      }
  
      const blobName = new Date().toISOString() + "." + file.type.split("/")[1];
      const blobService = new BlobServiceClient(
        `https://${Keys.storageAccountName}.blob.core.windows.net?${Keys.sasToken}`
      );
      const containerClient = blobService.getContainerClient(Keys.containerName);
      const blobClient = containerClient.getBlockBlobClient(blobName);
  
      const options = {
        blobHTTPHeaders: {
          blobContentType: file.type
        },
        onProgress: onProgress // Monitorando o progresso do upload
      };
  
      await blobClient.uploadData(file, options);
      const blobUrl = `https://${Keys.storageAccountName}.blob.core.windows.net/${Keys.containerName}/${blobName}`;
      return blobUrl;
  
    } catch (error) {
      console.error("Erro ao fazer upload:", error.message);
      return false;
    }
  };
  