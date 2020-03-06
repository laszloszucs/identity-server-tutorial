using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace IdentityServer
{
    public class Startup
    {
        public IWebHostEnvironment Environment { get; }

        public Startup(IWebHostEnvironment environment)
        {
            Environment = environment;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            var builder = services.AddIdentityServer()
                .AddInMemoryIdentityResources(Config.GetIdentityResources()) // TODO https://localhost:44300/.well-known/openid-configuration
                .AddInMemoryApiResources(Config.GetApis()) // Itt töltődnek be az Resource-ok (API-k, amiket védeni kell)
                .AddInMemoryClients(Config.GetClients()) // és a Client-ek, melyek a megbízható alkalmazások
                .AddTestUsers(Config.GetUsers()); // Test Userek az Identity Server bejelentkezés teszteléséhez (password grant, user related services support, profile service support) // TODO

            if (Environment.IsDevelopment())
            {
                builder.AddDeveloperSigningCredential(); // developer signing key generálás, nem kell verziókezelni, mindig létrejön magától, hogyha nincs
            }
            else
            {
                throw new Exception("need to configure key material");
            }
        }

        public void Configure(IApplicationBuilder app)
        {
            if (Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseIdentityServer();
        }
    }
}
