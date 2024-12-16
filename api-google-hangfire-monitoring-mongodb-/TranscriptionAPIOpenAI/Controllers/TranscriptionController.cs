using Google.Apis.Auth.OAuth2.Responses;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Hangfire;
using System.Globalization;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Bson.Serialization.Attributes;
using Microsoft.Extensions.Configuration; // necessario paara acessar appsettings
using System.Text;  //NormalizationForm pertence a esse namespace


namespace TranscriptionAPIGoogle.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TranscriptionController : ControllerBase
    {
        private readonly IMongoCollection<TranscriptionDocument> _transcriptionCollection;

        public TranscriptionController(IConfiguration configuration)
        {
            // Lê as configurações do appsettings.json
            var mongoSettings = configuration.GetSection("DevNetStoreDatabase");
            var connectionString = mongoSettings["ConnectionString"];
            var databaseName = mongoSettings["DatabaseName"];
            var transcriptionCollectionName = mongoSettings["ProdutoCollectionName"];
            var foldersCollectionName = "FoldersCollection"; // Nome da nova coleção para pastas

            // Configuração do MongoDB
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(databaseName);

            // Configuração para a coleção de transcrições (mantida)
            _transcriptionCollection = database.GetCollection<TranscriptionDocument>(transcriptionCollectionName);

            // Configuração para a nova coleção de pastas
            _foldersCollection = database.GetCollection<FolderDocument>(foldersCollectionName);
        }




        // URLs e credenciais do Google API
        private const string AuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
        private const string TokenUrl = "https://oauth2.googleapis.com/token";
        private const string DriveFileUrl = "https://www.googleapis.com/drive/v3/files";
        private const string ClientId = "797193471260-u0t7ic9eqdvmnookfl17vuu30jva7m7b.apps.googleusercontent.com";
        private const string ClientSecret = "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";
        private const string RedirectUri = "https://localhost:7220/Transcription/callback";
        private const string AccessScopes = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";

        // Variável para armazenar o token de acesso
        private static TokenResponse? GoogleTokenResponse;

        // Endpoint para obter a URL de consentimento do Google OAuth
        [HttpGet("auth-url")]
        public IActionResult GetConsentUrl()
        {
            var consentUrl = $"{AuthUrl}?client_id={ClientId}&redirect_uri={RedirectUri}&response_type=code&scope={AccessScopes}&access_type=offline&prompt=consent";
            return Ok(new { url = consentUrl });
        }

        // Endpoint para tratar o callback e obter o token de acesso
        [HttpGet("callback")]
        public async Task<IActionResult> Callback(string code)
        {
            if (string.IsNullOrEmpty(code))
                return BadRequest("Código de autorização não foi fornecido.");

            try
            {
                // Requisição para obter o token de acesso do Google
                var tokenData = await GetGoogleTokenAsync(code);

                if (tokenData == null || string.IsNullOrEmpty(tokenData.AccessToken))
                    return BadRequest("Erro ao obter ou processar o token.");

                // Salvar o token obtido
                GoogleTokenResponse = tokenData;

                // Retornar o token e o tempo de expiração
                return Ok(new
                {
                    AccessToken = tokenData.AccessToken,
                    RefreshToken = tokenData.RefreshToken,
                    ExpiresIn = tokenData.ExpiresInSeconds
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        // Função auxiliar para obter o token de acesso do Google
        private async Task<TokenResponse?> GetGoogleTokenAsync(string code)
        {
            using var httpClient = new HttpClient();
            var tokenRequest = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "client_id", ClientId },
                { "client_secret", ClientSecret },
                { "redirect_uri", RedirectUri },
                { "code", code },
                { "grant_type", "authorization_code" }
            });

            var response = await httpClient.PostAsync(TokenUrl, tokenRequest);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Erro ao obter o token. Status: {response.StatusCode}, Detalhes: {errorContent}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<TokenResponse>(responseContent);
        }
        // Endpoint para listar pastas do Google Drive
        [HttpGet("folders")]
        public async Task<IActionResult> ListFolders()
        {
            if (GoogleTokenResponse == null)
                return Unauthorized("Token de acesso não encontrado.");

            try
            {
                var folders = await GetGoogleDriveRootFoldersAsync();
                return Ok(new { folders });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao listar pastas: {ex.Message}");
            }
        }

        private async Task<Dictionary<string, object>> GetGoogleDriveRootFoldersAsync()
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {GoogleTokenResponse.AccessToken}");

            var allFolders = new List<dynamic>();
            string nextPageToken = null;

            // Consulta somente itens da raiz
            do
            {
                var url = $"{DriveFileUrl}?q='root' in parents" + (string.IsNullOrEmpty(nextPageToken) ? "" : $"&pageToken={nextPageToken}");
                var response = await httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                    throw new Exception($"Erro ao listar pastas. Status: {response.StatusCode}");

                var content = await response.Content.ReadAsStringAsync();
                var responseJson = JsonConvert.DeserializeObject<dynamic>(content);

                allFolders.AddRange(responseJson.files); // Aqui ainda é "files" porque é a resposta da API do Google Drive
                nextPageToken = responseJson?.nextPageToken?.ToString();
            } while (!string.IsNullOrEmpty(nextPageToken));

            // Retorna a hierarquia organizada
            return BuildDriveHierarchy(allFolders);
        }

        private Dictionary<string, object> BuildDriveHierarchy(List<dynamic> items)
        {
            var hierarchy = new Dictionary<string, object>();

            foreach (var item in items)
            {
                string name = item.name;
                string id = item.id;
                string mimeType = item.mimeType;
                string parentId = item.parents != null && item.parents.Count > 0 ? item.parents[0].ToString() : null;

                var folderData = new Dictionary<string, object>
        {
            { "name", name },
            { "id", id },
            { "mimeType", mimeType }
        };

                if (string.IsNullOrEmpty(parentId))
                {
                    // Item no nível raiz
                    AddToHierarchy(hierarchy, name, folderData, mimeType);
                }
                else
                {
                    // Item dentro de uma pasta
                    if (!hierarchy.ContainsKey(parentId))
                    {
                        hierarchy[parentId] = new Dictionary<string, object>();
                    }

                    AddToHierarchy((Dictionary<string, object>)hierarchy[parentId], name, folderData, mimeType);
                }
            }

            return hierarchy;
        }

        private void AddToHierarchy(Dictionary<string, object> hierarchy, string name, Dictionary<string, object> folderData, string mimeType)
        {
            string id = folderData["id"].ToString();

            if (mimeType == "application/vnd.google-apps.folder")
            {
                // Se for uma pasta, armazena apenas o id da pasta
                if (!hierarchy.ContainsKey("Folders"))
                {
                    hierarchy["Folders"] = new Dictionary<string, string>();
                }

                var folders = (Dictionary<string, string>)hierarchy["Folders"];
                if (!folders.ContainsKey(name))
                {
                    folders[name] = id; // Adiciona o ID da pasta
                }
            }
            else
            {
                // Se for um arquivo, armazena apenas o id do arquivo
                if (!hierarchy.ContainsKey("Files"))
                {
                    hierarchy["Files"] = new Dictionary<string, string>();
                }

                var files = (Dictionary<string, string>)hierarchy["Files"];
                if (!files.ContainsKey(name))
                {
                    files[name] = id; // Adiciona o ID do arquivo
                }
            }
        }


        // Endpoint para listar arquivos de uma pasta específica
        [HttpGet("files/{folderId}")]
        public async Task<IActionResult> ListFilesInFolder(string folderId)
        {
            if (GoogleTokenResponse == null)
                return Unauthorized("Token de acesso não encontrado.");

            try
            {
                var filesInFolder = await GetGoogleDriveFilesInFolderAsync(folderId);
                return Ok(new { files = filesInFolder });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao listar arquivos da pasta: {ex.Message}");
            }
        }

        // Função auxiliar para obter arquivos de uma pasta específica
        private async Task<List<Dictionary<string, object>>> GetGoogleDriveFilesInFolderAsync(string folderId)
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {GoogleTokenResponse.AccessToken}");

            var filesInFolder = new List<Dictionary<string, object>>();
            string nextPageToken = null;

            do
            {
                // Define a URL para listar arquivos de uma pasta específica
                var url = $"{DriveFileUrl}?q='{folderId}'+in+parents&fields=files(id,name,mimeType,createdTime,size),nextPageToken"
                          + (string.IsNullOrEmpty(nextPageToken) ? "" : $"&pageToken={nextPageToken}");
                var response = await httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                    throw new Exception($"Erro ao listar arquivos. Status: {response.StatusCode}");

                var content = await response.Content.ReadAsStringAsync();
                var responseJson = JsonConvert.DeserializeObject<dynamic>(content);

                // Adiciona cada arquivo no formato desejado
                foreach (var file in responseJson.files)
                {
                    long? fileSizeInBytes = file.size != null ? (long?)file.size : null;
                    string fileSizeFormatted = fileSizeInBytes.HasValue ? FormatFileSize(fileSizeInBytes.Value) : "Desconhecido";

                    var fileData = new Dictionary<string, object>
            {
                { "fileName", (string)file.name },
                { "fileId", (string)file.id },
                { "fileType", (string)file.mimeType },
                { "createdAt", (string)file.createdTime },
                { "fileSize", fileSizeFormatted } // Usa o tamanho formatado
            };
                    filesInFolder.Add(fileData);
                }

                nextPageToken = responseJson?.nextPageToken?.ToString();
            } while (!string.IsNullOrEmpty(nextPageToken));

            return filesInFolder;
        }

        // Função para formatar o tamanho do arquivo
        private string FormatFileSize(long fileSize)
        {
            if (fileSize < 1024)
                return $"{fileSize} Bytes";
            else if (fileSize < 1024 * 1024)
                //return $"{(fileSize / 1024.0):F2} KB";  Formato "F2" sem especificar a cultura.Utiliza a cultura do servidor,se estiver configurada para usar vírgula como separador decimal, o resultado seria um número com vírgula.
                return $"{(fileSize / 1024.0).ToString("F2", CultureInfo.InvariantCulture)} KB"; // Formata o tamanho do arquivo usando a cultura invariante para garantir o uso de ponto como separador decimal.
            else if (fileSize < 1024 * 1024 * 1024)
                return $"{(fileSize / (1024.0 * 1024.0)).ToString("F2", CultureInfo.InvariantCulture)} MB";
            else if (fileSize < 1024L * 1024L * 1024L * 1024L)
                return $"{(fileSize / (1024.0 * 1024.0 * 1024.0)).ToString("F2", CultureInfo.InvariantCulture)} GB";
            else
                return $"{(fileSize / (1024.0 * 1024.0 * 1024.0 * 1024.0)).ToString("F2", CultureInfo.InvariantCulture)} TB";
        }



        // Endpoint para excluir um arquivo pelo ID
        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteFile([FromQuery] string fileId)
        {
            if (GoogleTokenResponse == null)
                return Unauthorized("Token de acesso não encontrado.");

            if (string.IsNullOrEmpty(fileId))
                return BadRequest("ID do arquivo não fornecido.");

            try
            {
                await DeleteFileFromDriveAsync(fileId);
                return Ok(new { Message = "Arquivo excluído com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao excluir o arquivo: {ex.Message}");
            }
        }

        // Função auxiliar para excluir um arquivo do Google Drive
        private async Task DeleteFileFromDriveAsync(string fileId)
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {GoogleTokenResponse.AccessToken}");

            var response = await httpClient.DeleteAsync($"{DriveFileUrl}/{fileId}");
            if (!response.IsSuccessStatusCode)
                throw new Exception($"Erro ao excluir arquivo. Status: {response.StatusCode}");
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file, string parentId = null)
        {
            if (GoogleTokenResponse == null)
                return Unauthorized("Token de acesso não encontrado.");

            if (file == null || file.Length == 0)
                return BadRequest("Nenhum arquivo foi enviado.");

            try
            {
                var uploadedFile = await UploadFileToDriveAsync(file, parentId);
                return Ok(new { FileId = uploadedFile.Id, FileName = uploadedFile.Name });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao fazer upload do arquivo: {ex.Message}");
            }
        }

        private async Task<(string Id, string Name)> UploadFileToDriveAsync(IFormFile file, string parentId)
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {GoogleTokenResponse.AccessToken}");

            // Cria o JSON de metadados com o nome do arquivo e o parentId
            var metadata = new
            {
                name = file.FileName,
                parents = !string.IsNullOrEmpty(parentId) ? new[] { parentId } : null
            };
            var metadataContent = new StringContent(JsonConvert.SerializeObject(metadata));
            metadataContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");

            // Configura o conteúdo do arquivo
            var fileContent = new StreamContent(file.OpenReadStream());
            fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);

            // Adiciona o metadado e o conteúdo do arquivo ao MultipartFormDataContent
            var content = new MultipartFormDataContent
    {
        { metadataContent, "metadata" },
        { fileContent, "file" }
    };

            // Envia a solicitação de upload para o Google Drive (note a URL de upload)
            var response = await httpClient.PostAsync("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", content);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Erro ao fazer upload do arquivo. Status: {response.StatusCode}, Detalhes: {errorContent}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            dynamic responseJson = JsonConvert.DeserializeObject(responseContent);

            return (Id: responseJson.id.ToString(), Name: responseJson.name.ToString());
        }

        [HttpGet("download")]
        public async Task<IActionResult> DownloadFile(string fileId)
        {
            if (GoogleTokenResponse == null)
                return Unauthorized("Token de acesso não encontrado.");

            if (string.IsNullOrEmpty(fileId))
                return BadRequest("ID do arquivo não fornecido.");

            try
            {
                var (fileStream, fileName, contentType) = await DownloadFileFromDriveAsync(fileId);
                return File(fileStream, contentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao baixar o arquivo: {ex.Message}");
            }
        }

        private async Task<(Stream FileStream, string FileName, string ContentType)> DownloadFileFromDriveAsync(string fileId)
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {GoogleTokenResponse.AccessToken}");

            // Solicita o conteúdo do arquivo para download
            var response = await httpClient.GetAsync($"{DriveFileUrl}/{fileId}?alt=media");
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Erro ao baixar o arquivo. Status: {response.StatusCode}, Detalhes: {errorContent}");
            }

            // Extrai o nome do arquivo e o tipo de conteúdo do cabeçalho
            var fileName = response.Content.Headers.ContentDisposition?.FileName?.Trim('"') ?? fileId;
            var contentType = response.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";

            // Cria um stream de memória para o conteúdo do arquivo
            var fileStream = await response.Content.ReadAsStreamAsync();

            return (FileStream: fileStream, FileName: fileName, ContentType: contentType);
        }


        private static Dictionary<string, string> _folderState = new Dictionary<string, string>();

        private async Task<List<Dictionary<string, object>>> MonitorGoogleDriveFolderAsync(string folderId)
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {GoogleTokenResponse.AccessToken}");

            var url = $"{DriveFileUrl}?q='{folderId}'+in+parents&fields=files(id,name,modifiedTime)";
            var response = await httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Erro ao monitorar pasta. Status: {response.StatusCode}");

            var content = await response.Content.ReadAsStringAsync();
            var responseJson = JsonConvert.DeserializeObject<dynamic>(content);

            var currentFiles = new Dictionary<string, string>();
            var newFiles = new List<Dictionary<string, object>>();

            foreach (var file in responseJson.files)
            {
                string fileId = file.id;
                string fileName = file.name;
                string modifiedTime = file.modifiedTime;

                currentFiles[fileId] = modifiedTime;

                // Verifica se é um arquivo novo ou modificado
                if (!_folderState.ContainsKey(fileId) || _folderState[fileId] != modifiedTime)
                {
                    newFiles.Add(new Dictionary<string, object>
            {
                { "id", fileId },
                { "name", fileName },
                { "modifiedTime", modifiedTime }
            });
                }
            }

            // Atualiza o estado da pasta
            _folderState = currentFiles;

            return newFiles;
        }

        private static readonly HashSet<string> SupportedExtensions = new HashSet<string>
                {
                 ".flac", ".wav", ".mp3", ".amr", ".awb", ".ogg", ".opus", ".spx"
                };

        [HttpPost("monitor-and-transcribe/{folderId}")]
        public async Task<IActionResult> MonitorAndTranscribe(string folderId)
        {
            if (GoogleTokenResponse == null)
            {
                Console.WriteLine("Token de acesso não encontrado.");
                return Unauthorized("Token de acesso não encontrado.");
            }

            try
            {
                Console.WriteLine($"Iniciando monitoramento e transcrição para a pasta {folderId}.");

                // Obter os novos arquivos na pasta
                var newFiles = await MonitorGoogleDriveFolderAsync(folderId);

                Console.WriteLine($"Arquivos recuperados: {newFiles.Count}");

                if (newFiles.Count == 0)
                {
                    Console.WriteLine("Nenhum novo arquivo encontrado.");
                    return Ok(new { Message = "Nenhum novo arquivo encontrado." });
                }

                foreach (var file in newFiles)
                {
                    if (!file.ContainsKey("id") || !file.ContainsKey("name"))
                    {
                        Console.WriteLine("Arquivo inválido encontrado (sem ID ou nome). Ignorando.");
                        continue;
                    }

                    var fileId = file["id"].ToString();
                    var fileName = file["name"].ToString();
                    var extension = Path.GetExtension(fileName).ToLower();

                    Console.WriteLine($"Processando arquivo: Nome = {fileName}, ID = {fileId}");

                    // Verificar se o arquivo já foi transcrito
                    var existingDocument = await _transcriptionCollection
                        .Find(t => t.FileId == fileId)
                        .FirstOrDefaultAsync();

                    if (existingDocument != null)
                    {
                        Console.WriteLine($"Arquivo {fileName} já foi transcrito. Ignorando.");
                        continue;
                    }

                    // Validar apenas pela extensão do arquivo
                    if (SupportedExtensions.Contains(extension))
                    {
                        Console.WriteLine($"Adicionando o arquivo {fileName} à fila do Hangfire.");
                        // Passar o folderId ao método de processamento
                        BackgroundJob.Enqueue(() => ProcessFileForTranscription(fileId, fileName, extension, folderId));
                    }
                    else
                    {
                        Console.WriteLine($"Arquivo {fileName} ignorado (Extensão não suportada: {extension}).");
                    }
                }

                return Ok(new { Message = "Arquivos qualificados adicionados à fila de processamento." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao processar arquivos: {ex.Message}");
                return StatusCode(500, new { Message = $"Erro ao processar arquivos: {ex.Message}" });
            }
        }




        [NonAction]
        public async Task TranscribeFileInMemory(string fileId, string fileName, string fileType, string folderId)
        {
            try
            {
                Console.WriteLine($"Iniciando transcrição do arquivo com ID {fileId}, Nome = {fileName}, Tipo = {fileType}, Pasta = {folderId}.");


                // Configurar HttpClient para acessar o Google Drive
                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {GoogleTokenResponse.AccessToken}");

                // Obter o conteúdo real do arquivo
                var fileContentResponse = await httpClient.GetAsync($"{DriveFileUrl}/{fileId}?alt=media");
                if (!fileContentResponse.IsSuccessStatusCode)
                {
                    throw new Exception($"Erro ao baixar o conteúdo do arquivo. Detalhes: {await fileContentResponse.Content.ReadAsStringAsync()}");
                }

                var fileBytes = await fileContentResponse.Content.ReadAsByteArrayAsync();

                // Configurar a solicitação para o serviço de transcrição
                var apiKey = "AIzaSyDsdydsXSVeoAqzcZiDimuB21W8VDPQrAI"; // Substitua pela sua API Key válida
                var transcriptionUrl = $"https://speech.googleapis.com/v1/speech:recognize?key={apiKey}";

                var requestBody = new
                {
                    config = new
                    {
                        encoding = DetermineEncoding(fileName), // Determina o formato com base no arquivo
                        sampleRateHertz = GetSampleRate(fileName), // Define a taxa de amostragem correta
                        languageCode = "pt-BR",
                        audioChannelCount = GetAudioChannelCount(fileName), // Determina dinamicamente os canais
                        enableWordTimeOffsets = true
                    },
                    audio = new { content = Convert.ToBase64String(fileBytes) }
                };

                using var client = new HttpClient();
                using var content = new StringContent(JsonConvert.SerializeObject(requestBody), System.Text.Encoding.UTF8);
                content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");

                var transcriptionResponse = await client.PostAsync(transcriptionUrl, content);
                var jsonResponse = await transcriptionResponse.Content.ReadAsStringAsync();

                if (!transcriptionResponse.IsSuccessStatusCode)
                {
                    throw new Exception($"Erro na transcrição. Detalhes: {jsonResponse}");
                }

                var transcriptionResult = JsonConvert.DeserializeObject<JObject>(jsonResponse);
                var results = transcriptionResult["results"]?.ToObject<List<JObject>>();

                if (results == null || results.Count == 0)
                {
                    Console.WriteLine("Nenhum resultado encontrado na transcrição.");
                    return;
                }

                // Extrair texto transcrito
                var transcriptionText = string.Join(" ", results.Select(result => result["alternatives"]?[0]?["transcript"]?.ToString()));

                // Extrair confiança média
                var confidence = results
                    .Select(result => (double?)result["alternatives"]?[0]?["confidence"])
                    .Where(c => c.HasValue)
                    .Average() ?? 0;

                // Extrair palavras e timestamps
                var wordTimestamps = new List<KeywordWithTimestamp>();
                foreach (var result in results)
                {
                    var alternatives = result["alternatives"]?[0];
                    var words = alternatives?["words"]?.ToObject<List<JObject>>();

                    if (words != null)
                    {
                        foreach (var wordInfo in words)
                        {
                            wordTimestamps.Add(new KeywordWithTimestamp
                            {
                                Keyword = wordInfo["word"]?.ToString(),
                                StartTime = wordInfo["startTime"]?.ToString(),
                                EndTime = wordInfo["endTime"]?.ToString()
                            });
                        }
                    }
                }

                // Calcular a duração com base no timestamp da última palavra
                var duration = wordTimestamps.LastOrDefault()?.EndTime ?? "00:00:00";

                // Salvar no MongoDB
                // Criar o documento para o MongoDB
                var transcriptionDocument = new TranscriptionDocument
                {
                    Id = ObjectId.GenerateNewId().ToString(),
                    FileId = fileId,
                    FileName = fileName,
                    FileType = fileType,
                    FolderId = folderId, // Dinamicamente atribuído
                    Duration = duration,
                    Confidence = confidence,
                    Transcription = transcriptionText,
                    WordTimestamps = wordTimestamps,
                    CreatedAt = DateTime.UtcNow
                };

                // Salvar no MongoDB
                await _transcriptionCollection.InsertOneAsync(transcriptionDocument);
                Console.WriteLine($"Transcrição salva no MongoDB com ID {transcriptionDocument.Id}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro durante a transcrição do arquivo com ID {fileId}: {ex.Message}");
            }
        }



        private string DetermineEncoding(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                throw new ArgumentException("O nome do arquivo está vazio ou nulo.");

            var extension = Path.GetExtension(fileName).ToLower();

            return extension switch
            {
                ".flac" => "FLAC",
                ".wav" => "LINEAR16",
                ".mp3" => "MP3",
                ".amr" => "AMR",
                ".awb" => "AMR_WB",
                ".ogg" => "OGG_OPUS",
                ".opus" => "OGG_OPUS",
                ".spx" => "SPEEX_WITH_HEADER_BYTE",
                _ => throw new NotSupportedException($"Formato de áudio não suportado: {extension}")
            };
        }

        private int GetSampleRate(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLower();

            return extension switch
            {
                ".ogg" => 16000, // Taxa suportada para OGG_OPUS
                ".flac" => 44100, // Taxa típica para FLAC
                ".mp3" => 44100, // Taxa padrão para MP3
                ".wav" => 44100, // Ajuste conforme necessário
                _ => throw new NotSupportedException($"Formato de áudio não suportado: {extension}")
            };
        }

        private int GetAudioChannelCount(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLower();

            return extension switch
            {
                ".flac" => 2, // Defina como 2 para arquivos FLAC (ou ajuste se for necessário)
                ".mp3" => 1,  // Geralmente 1 canal para MP3 simples
                ".wav" => 2,  // Defina conforme necessário
                _ => 1        // Configuração padrão
            };
        }

        [NonAction]
        public async Task ProcessFileForTranscription(string fileId, string fileName, string fileType, string folderId)
        {
            if (GoogleTokenResponse == null)
                throw new UnauthorizedAccessException("Token de acesso não encontrado.");

            try
            {
                Console.WriteLine($"Processando arquivo com ID {fileId} para transcrição...");

                // Passar folderId para a lógica de transcrição
                await TranscribeFileInMemory(fileId, fileName, fileType, folderId);

                Console.WriteLine($"Arquivo com ID {fileId} foi processado com sucesso.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro durante o processamento do arquivo com ID {fileId}: {ex.Message}");
            }
        }



        [HttpPost("schedule-monitor-and-transcribe/{folderId}")]
        public IActionResult ScheduleMonitorAndTranscribe(string folderId)
        {
            if (GoogleTokenResponse == null)
                return Unauthorized("Token de acesso não encontrado.");

            // Agendar tarefa recorrente para monitorar e transcrever a pasta
            RecurringJob.AddOrUpdate(
                $"MonitorAndTranscribe-{folderId}",
                () => MonitorAndTranscribe(folderId),
                Cron.Minutely // Executa a cada minuto
            );

            return Ok(new { Message = "Monitoramento e transcrição automáticos agendados com sucesso!", FolderId = folderId });
        }



        [HttpGet("transcriptions")]
        public async Task<IActionResult> GetTranscriptions()
        {
            try
            {
                var transcriptions = await _transcriptionCollection.Find(_ => true).ToListAsync();
                return Ok(transcriptions);
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao buscar transcrições: {ex.Message}");
            }
        }

        [HttpPost("search-keywords")]
        public async Task<IActionResult> SearchKeywords([FromBody] List<string> keywords)
        {
            try
            {
                if (keywords == null || !keywords.Any())
                    return BadRequest("Nenhuma palavra-chave fornecida.");

                // Buscar todas as transcrições
                var transcriptions = await _transcriptionCollection.Find(_ => true).ToListAsync();

                // Encontrar todas as palavras-chave que correspondem às pesquisadas e incluir informações do arquivo
                var results = transcriptions.SelectMany(t => t.WordTimestamps ?? new List<KeywordWithTimestamp>())
                    .Where(w => keywords.Contains(w.Keyword, StringComparer.OrdinalIgnoreCase))
                    .Select(w => new
                    {
                        w.Keyword,
                        w.StartTime,
                        w.EndTime,
                        fileId = transcriptions.FirstOrDefault(t => t.WordTimestamps.Contains(w))?.FileId,  // Buscar o FileId
                        fileName = transcriptions.FirstOrDefault(t => t.WordTimestamps.Contains(w))?.FileName,  // Buscar o FileName
                        folderId = transcriptions.FirstOrDefault(t => t.WordTimestamps.Contains(w))?.FolderId,
                        duration = transcriptions.FirstOrDefault(t => t.WordTimestamps.Contains(w))?.Duration,
                        fileType = transcriptions.FirstOrDefault(t => t.WordTimestamps.Contains(w))?.FileType,
                        createdAt = transcriptions.FirstOrDefault(t => t.WordTimestamps.Contains(w))?.CreatedAt,
                        favorito = transcriptions.FirstOrDefault(t => t.WordTimestamps.Contains(w))?.Favorito

                    })
                    .ToList();

                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao buscar palavras-chave: {ex.Message}");
            }
        }



        [HttpPost("folders/save")]
        public async Task<IActionResult> SaveFolder([FromBody] FolderModel folder)
        {
            try
            {
                if (folder == null || string.IsNullOrEmpty(folder.FolderId) || string.IsNullOrEmpty(folder.FolderName))
                {
                    return BadRequest("Dados da pasta estão incompletos.");
                }

                var folderDocument = new FolderDocument
                {
                    Id = ObjectId.GenerateNewId().ToString(),
                    FolderId = folder.FolderId,
                    FolderName = folder.FolderName,
                    CreatedAt = DateTime.UtcNow
                };

                await _foldersCollection.InsertOneAsync(folderDocument); // Salva na coleção de pastas
                return Ok(new { Message = "Pasta salva com sucesso!", FolderId = folderDocument.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao salvar a pasta: {ex.Message}");
            }
        }

        [HttpGet("folders/saved")]
        public async Task<IActionResult> GetSavedFolders()
        {
            try
            {
                var folders = await _foldersCollection.Find(_ => true).ToListAsync(); // Busca na coleção de pastas
                return Ok(folders.Select(f => new { f.FolderId, f.FolderName }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao buscar as pastas salvas: {ex.Message}");
            }
        }

        [HttpDelete("folders/delete/{folderId}")]
        public async Task<IActionResult> DeleteFolder(string folderId)
        {
            try
            {
                if (string.IsNullOrEmpty(folderId))
                {
                    return BadRequest("O ID da pasta não foi fornecido.");
                }

                var result = await _foldersCollection.DeleteOneAsync(folder => folder.FolderId == folderId);

                if (result.DeletedCount == 0)
                {
                    return NotFound("Nenhuma pasta encontrada com o ID especificado.");
                }

                return Ok(new { Message = "Pasta excluída com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao excluir a pasta: {ex.Message}");
            }
        }

        [HttpPatch("transcriptions/{id}/favorite")]
        public async Task<IActionResult> MarkAsFavorite(string id)
        {
            try
            {
                var filter = Builders<TranscriptionDocument>.Filter.Eq(t => t.Id, id);
                var update = Builders<TranscriptionDocument>.Update.Set(t => t.Favorito, true);

                var result = await _transcriptionCollection.UpdateOneAsync(filter, update);

                if (result.MatchedCount == 0)
                    return NotFound(new { Message = "Transcrição não encontrada." });

                return Ok(new { Message = "Transcrição marcada como favorita com sucesso!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Erro ao marcar como favorito: {ex.Message}" });
            }
        }

        [HttpPatch("transcriptions/{id}/unfavorite")]
        public async Task<IActionResult> UnmarkAsFavorite(string id)
        {
            try
            {
                var filter = Builders<TranscriptionDocument>.Filter.Eq(t => t.Id, id);
                var update = Builders<TranscriptionDocument>.Update.Set(t => t.Favorito, false);

                var result = await _transcriptionCollection.UpdateOneAsync(filter, update);

                if (result.MatchedCount == 0)
                    return NotFound(new { Message = "Transcrição não encontrada." });

                return Ok(new { Message = "Transcrição desmarcada como favorita com sucesso!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Erro ao desmarcar como favorito: {ex.Message}" });
            }
        }


        private readonly IMongoCollection<FolderDocument> _foldersCollection;


        [HttpPost("files-status")]
        public async Task<IActionResult> GetFilesStatus([FromBody] List<string> folderIds)
        {
            if (GoogleTokenResponse == null)
                return Unauthorized("Token de acesso não encontrado.");

            if (folderIds == null || folderIds.Count == 0)
                return BadRequest("Nenhum ID de pasta fornecido.");

            try
            {
                var allFilesWithStatus = new List<object>();

                foreach (var folderId in folderIds)
                {
                    var filesInFolder = await GetGoogleDriveFilesInFolderAsync(folderId);

                    if (filesInFolder == null || filesInFolder.Count == 0)
                        continue;

                    var transcriptions = await _transcriptionCollection.Find(_ => true).ToListAsync();
                    var transcribedFileIds = new HashSet<string>(transcriptions.Select(t => t.FileId));

                    var filesWithStatus = filesInFolder.Select(file =>
                    {
                        var fileId = file["fileId"].ToString();
                        var status = transcribedFileIds.Contains(fileId) ? "Transcrito" : "Pendente";

                        return new
                        {
                            FileName = file["fileName"].ToString(),
                            FileId = fileId,
                            FolderId = folderId,
                            Status = status
                        };
                    });

                    allFilesWithStatus.AddRange(filesWithStatus);
                }

                return Ok(new { Files = allFilesWithStatus });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Erro ao determinar status dos arquivos: {ex.Message}");
                return StatusCode(500, $"Erro ao determinar status dos arquivos: {ex.Message}");
            }
        }



        [HttpGet("transcription-detail/{fileId}")]
        public async Task<IActionResult> GetTranscriptionDetail(string fileId)
        {
            if (string.IsNullOrEmpty(fileId))
                return BadRequest("FileId não foi fornecido.");

            try
            {
                // Buscar a transcrição pelo FileId no MongoDB
                var transcription = await _transcriptionCollection
                    .Find(t => t.FileId == fileId)
                    .FirstOrDefaultAsync();

                // Retornar 404 se a transcrição não for encontrada
                if (transcription == null)
                    return NotFound(new { Message = "Transcrição não encontrada." });

                // Formatar a resposta
                var response = new
                {
                    Transcription = transcription.Transcription,
                    Keywords = transcription.WordTimestamps?.Select(w => new
                    {
                        w.Keyword,
                        w.StartTime
                    })
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                // Tratar erros internos
                return StatusCode(500, new { Message = $"Erro interno: {ex.Message}" });
            }
        }




        [HttpGet("userinfo")]
        public async Task<IActionResult> GetUserInfo()
        {
            if (GoogleTokenResponse == null || string.IsNullOrEmpty(GoogleTokenResponse.AccessToken))
                return Unauthorized("Token de acesso não encontrado ou inválido.");

            try
            {
                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {GoogleTokenResponse.AccessToken}");

                var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return StatusCode((int)response.StatusCode, $"Erro ao obter informações do usuário: {errorContent}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var userInfo = JsonConvert.DeserializeObject<GoogleUserInfo>(responseContent);

                return Ok(userInfo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpGet("transcription-detail/{fileId}/{keyword}")]
        public async Task<IActionResult> GetTranscriptionDetailWithKeyword(string fileId, string keyword)
        {
            if (string.IsNullOrEmpty(fileId) || string.IsNullOrEmpty(keyword))
                return BadRequest("FileId e/ou palavra-chave não foram fornecidos.");

            try
            {
                // Buscar a transcrição pelo FileId no MongoDB
                var transcription = await _transcriptionCollection
                    .Find(t => t.FileId == fileId)
                    .FirstOrDefaultAsync();

                if (transcription == null)
                    return NotFound(new { Message = "Transcrição não encontrada." });

                // Normalizar texto para ignorar acentos e diferenças de caixa
                string Normalize(string text) =>
                    new string(text
                        .Normalize(NormalizationForm.FormD)
                        .Where(c => char.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                        .ToArray())
                    .ToLowerInvariant();

                string normalizedKeyword = Normalize(keyword);

                // Procurar pela palavra-chave normalizada na lista de palavras (comparação exata)
                var matchingWords = transcription.WordTimestamps?
                    .Where(w => Normalize(w.Keyword) == normalizedKeyword)
                    .Select(w => new
                    {
                        w.Keyword,
                        w.StartTime
                    })
                    .ToList();

                if (matchingWords == null || !matchingWords.Any())
                    return NotFound(new { Message = "Palavra-chave não encontrada na transcrição." });

                return Ok(matchingWords);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Erro interno: {ex.Message}" });
            }
        }

        [HttpGet("files-with-status/{folderId}")]
        public async Task<IActionResult> ListFilesWithStatus(string folderId)
        {
            if (GoogleTokenResponse == null)
                return Unauthorized("Token de acesso não encontrado.");

            try
            {
                // Obtém os arquivos da pasta
                var filesInFolder = await GetGoogleDriveFilesInFolderAsync(folderId);

                // Obtém todas as transcrições
                var transcriptions = await _transcriptionCollection.Find(_ => true).ToListAsync();
                var transcribedFileIds = new HashSet<string>(transcriptions.Select(t => t.FileId));

                // Associa status aos arquivos
                var filesWithStatus = filesInFolder.Select(file => new
                {
                    FileName = file["fileName"].ToString(),
                    FileId = file["fileId"].ToString(),
                    FileType = file["fileType"].ToString(),
                    CreatedAt = file["createdAt"].ToString(),
                    FileSize = file["fileSize"].ToString(),
                    Status = transcribedFileIds.Contains(file["fileId"].ToString()) ? "Transcrito" : "Pendente"
                });

                return Ok(new { Files = filesWithStatus });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao listar arquivos com status: {ex.Message}");
            }
        }

        [HttpGet("transcriptions-with-status")]
        public async Task<IActionResult> GetTranscriptionsWithStatus()
        {
            try
            {
                // Obtém todas as transcrições
                var transcriptions = await _transcriptionCollection.Find(_ => true).ToListAsync();

                // Mapeia cada transcrição e adiciona o campo Status
                var transcriptionsWithStatus = transcriptions.Select(transcription => new
                {
                    transcription.Id,
                    transcription.FileId,
                    transcription.FileName,
                    transcription.FileType,
                    transcription.FolderId,
                    transcription.Duration,
                    transcription.Confidence,
                    transcription.Transcription,
                    transcription.WordTimestamps,
                    transcription.CreatedAt,
                    transcription.Favorito,
                    Status = "Transcrito" // Status fixo como Transcrito
                });

                return Ok(transcriptionsWithStatus);
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao buscar transcrições: {ex.Message}");
            }
        }






        public class GoogleUserInfo
        {
            public string Sub { get; set; }
            public string Name { get; set; }
            public string GivenName { get; set; }
            public string FamilyName { get; set; }
            public string Picture { get; set; }
            public string Email { get; set; }
            public bool EmailVerified { get; set; }
            public string Locale { get; set; }
        }

        public class FolderModel
        {
            public string FolderId { get; set; }
            public string FolderName { get; set; }
        }

        public class FolderDocument
        {
            [BsonId]
            [BsonRepresentation(BsonType.ObjectId)]
            public string Id { get; set; }

            public string FolderId { get; set; }
            public string FolderName { get; set; }
            public DateTime CreatedAt { get; set; }
        }


        public class TranscriptionDocument
        {
            [BsonId]
            [BsonRepresentation(BsonType.ObjectId)]
            public string Id { get; set; }

            public string FileId { get; set; }
            public string FileName { get; set; }
            public string FileType { get; set; }
            public string FolderId { get; set; } // ID da pasta de origem
            public string Duration { get; set; } // Duração total
            public double Confidence { get; set; } // Média de confiança
            public string Transcription { get; set; }
            public List<KeywordWithTimestamp> WordTimestamps { get; set; }
            public DateTime CreatedAt { get; set; }

            public bool Favorito { get; set; }
        }

        public class KeywordWithTimestamp
        {
            public string Keyword { get; set; }
            public string StartTime { get; set; }
            public string EndTime { get; set; }
        }



    }
}
