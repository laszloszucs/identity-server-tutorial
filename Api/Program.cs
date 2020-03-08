using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Schwarzenegger.Core.DAL.Interfaces;
using Schwarzenegger.Core.Helpers;

namespace Schwarzenegger
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Console.Title = "Schwarzenegger";

            var host = CreateHostBuilder(args).Build();

            CreateDbIfNotExists(host);

            host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args)
        {
            return Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>().ConfigureLogging((hostingContext, logging) =>
                    {
                        logging.ClearProviders();
                        logging.AddConfiguration(hostingContext.Configuration.GetSection("Logging"));
                        logging.AddConsole();
                        logging.AddDebug();
                        logging.AddEventSourceLogger();
                        logging.AddFile(hostingContext.Configuration.GetSection("Logging"));
                    });
                });
        }

        private static void CreateDbIfNotExists(IHost host)
        {
            using var scope = host.Services.CreateScope();
            var services = scope.ServiceProvider;

            try
            {
                var databaseInitializer = services.GetRequiredService<IDatabaseInitializer>();
                databaseInitializer.InitializeAsync().Wait();
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<Program>>();
                logger.LogCritical(LoggingEvents.InitDatabase, ex, LoggingEvents.InitDatabase.Name);
                throw new Exception(LoggingEvents.InitDatabase.Name, ex);
            }
        }
    }
}