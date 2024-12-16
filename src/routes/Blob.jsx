import { useEffect, useState } from "react";
import "./styles.css";
import { CreateImageFile } from "../AzureConfig/ServerConfig";

export default function TesteBlob() {
  const [files, setFiles] = useState([]);
  const [blobUrls, setBlobUrls] = useState([]);
  const [progress, setProgress] = useState({});

  const handleUploadFile = async (e) => {
    e.preventDefault();

    if (files.length > 0) {
      const uploadPromises = files.map((file, index) => {
        return CreateImageFile(file, (progressEvent) => {
          // Calcula o progresso em porcentagem e armazena para cada arquivo
          const percentCompleted = Math.round((progressEvent.loadedBytes / file.size) * 100);
          setProgress(prev => ({ ...prev, [index]: percentCompleted }));
        }).then(url => url ? url : false);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setBlobUrls(uploadedUrls.filter(url => url !== false));
    }
  };

  useEffect(() => {
    setBlobUrls([]);
    setProgress({});
  }, [files]);

  return (
    <div className="container">
      <form onSubmit={handleUploadFile}>
        <div className="campo">
          <label className="file-input-label" htmlFor="arquivo">
            {files.length > 0 ? `${files.length} arquivos selecionados` : "Clique aqui para carregar os arquivos"}
          </label>
          <input
            required
            className="file-input"
            type="file"
            id="arquivo"
            accept="image/png, image/jpg, image/jpeg, video/*, audio/*"
            multiple
            onChange={e => setFiles(Array.from(e.target.files))}
          />
        </div>
        <button type="submit" disabled={files.length === 0}>
          Enviar arquivos
        </button>
      </form>

      <div className="progress-container">
        {files.map((file, index) => (
          <div key={index} className="progress-bar-wrapper">
            <p>{file.name}</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress[index] || 0}%` }}
              ></div>
            </div>
            <p>{progress[index] || 0}%</p>
          </div>
        ))}
      </div>

      {blobUrls.length > 0 && (
        <div>
          <h3>Arquivos Enviados:</h3>
          {blobUrls.map((url, index) => (
            <div key={index}>
              {url.includes("image") ? (
                <img src={url} alt={`Arquivo ${index + 1}`} style={{ width: '300px', height: 'auto', border: '1px solid #ccc' }} />
              ) : url.includes("video") ? (
                <video controls style={{ width: '300px', height: 'auto' }}>
                  <source src={url} />
                </video>
              ) : url.includes("audio") ? (
                <audio controls>
                  <source src={url} />
                </audio>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
