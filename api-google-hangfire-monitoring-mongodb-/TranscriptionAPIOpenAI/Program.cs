using Hangfire;
using Hangfire.Mongo;
using Hangfire.Mongo.Migration.Strategies;
using Hangfire.Mongo.Migration.Strategies.Backup;
using Microsoft.Extensions.Configuration;

namespace TranscriptionAPIOpenAI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Configuração do MongoDB do appsettings.json
            var mongoSettings = builder.Configuration.GetSection("DevNetStoreDatabase");
            var mongoConnectionString = mongoSettings.GetValue<string>("ConnectionString");
            var mongoDatabaseName = mongoSettings.GetValue<string>("DatabaseName");

            // Configuração do Hangfire com MongoDB usando uma coleção separada para logs
            builder.Services.AddHangfire(config => config.UseMongoStorage(
                mongoConnectionString,
                mongoDatabaseName,
                new MongoStorageOptions
                {
                    MigrationOptions = new MongoMigrationOptions
                    {
                        MigrationStrategy = new MigrateMongoMigrationStrategy(),
                        BackupStrategy = new CollectionMongoBackupStrategy()
                    },
                    Prefix = "HangfireLogs",
                    CheckConnection = true
                }));
            builder.Services.AddHangfireServer();

            // Adiciona CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins", policy =>
                {
                    policy.AllowAnyOrigin() // Permite qualquer origem
                          .AllowAnyMethod() // Permite qualquer método HTTP
                          .AllowAnyHeader(); // Permite qualquer cabeçalho
                });
            });

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configuração do pipeline HTTP
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            // Aplica o suporte ao CORS
            app.UseCors("AllowAllOrigins");

            app.UseAuthorization();

            // Configura o painel do Hangfire
            app.UseHangfireDashboard();

            app.MapControllers();

            app.Run();
        }
    }
}





//using Hangfire;
//using Hangfire.MemoryStorage;

//namespace TranscriptionAPIOpenAI
//{
//    public class Program
//    {
//        public static void Main(string[] args)
//        {
//            var builder = WebApplication.CreateBuilder(args);

//            // Adiciona o Hangfire ao serviço
//            builder.Services.AddHangfire(config => config.UseMemoryStorage());
//            builder.Services.AddHangfireServer();

//            // Add services to the container.
//            builder.Services.AddControllers();
//            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
//            builder.Services.AddEndpointsApiExplorer();
//            builder.Services.AddSwaggerGen();

//            var app = builder.Build();

//            // Configure the HTTP request pipeline.
//            if (app.Environment.IsDevelopment())
//            {
//                app.UseSwagger();
//                app.UseSwaggerUI();
//            }

//            app.UseHttpsRedirection();

//            app.UseAuthorization();

//            // Configura o painel do Hangfire
//            app.UseHangfireDashboard();

//            app.MapControllers();

//            app.Run();
//        }
//    }
//}
