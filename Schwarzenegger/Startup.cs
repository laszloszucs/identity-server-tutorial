using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using IdentityServer4.AccessTokenValidation;
using IdentityServer4.EntityFramework.Stores;
using IdentityServer4.Stores;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Schwarzenegger.Core;
using Schwarzenegger.Core.Authorization;
using Schwarzenegger.Core.DAL;
using Schwarzenegger.Core.DAL.Interfaces;
using Schwarzenegger.Core.ExtensionMethods;
using Schwarzenegger.Core.Helpers;
using Schwarzenegger.Core.Interfaces;
using Schwarzenegger.Core.Models;
using Schwarzenegger.Helpers;
using Schwarzenegger.Hubs;

namespace Schwarzenegger
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            Configuration = configuration;
            Environment = environment;
        }

        public IConfiguration Configuration { get; }
        private IWebHostEnvironment Environment { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvcCore()
                .AddApiExplorer()
                .AddNewtonsoftJson()
                .SetCompatibilityVersion(CompatibilityVersion.Version_3_0);

            services.AddSignalR().AddHubOptions<MainHub>(options =>
            {
                options.EnableDetailedErrors = true;
            });

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(Configuration["ConnectionStrings:SchwarzeneggerConnection"],
                    b => b.MigrationsAssembly("Schwarzenegger")));

            // add identity
            services.AddIdentity<ApplicationUser, ApplicationRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            // Configure Identity options and password complexity here
            services.Configure<IdentityOptions>(options =>
            {
                // User settings
                options.User.RequireUniqueEmail = true;

                //    //// Password settings
                //    //options.Password.RequireDigit = true;
                //    //options.Password.RequiredLength = 8;
                //    //options.Password.RequireNonAlphanumeric = false;
                //    //options.Password.RequireUppercase = true;
                //    //options.Password.RequireLowercase = false;

                //    //// Lockout settings
                //    //options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30);
                //    //options.Lockout.MaxFailedAccessAttempts = 10;
            });

            var allowedCorsOrigins = Configuration.GetSection("AllowedCorsOrigins").Get<string[]>();

            var builder = services.AddIdentityServer()
                .AddDeveloperSigningCredential()
                    //.AddPersistedGrantStore<PersistedGrantStore>()
                .AddConfigurationStore(option =>
                    option.ConfigureDbContext = builder => builder.UseNpgsql(Configuration.GetConnectionString("IdentityServerConnection"), options =>
                        options.MigrationsAssembly("Schwarzenegger")))
                .AddOperationalStore(option =>
                    option.ConfigureDbContext = builder => builder.UseNpgsql(Configuration.GetConnectionString("IdentityServerConnection"), options =>
                        options.MigrationsAssembly("Schwarzenegger")))
                .AddAspNetIdentity<ApplicationUser>()
                .AddProfileService<ProfileService>();

            if (Environment.IsDevelopment())
                builder
                    .AddDeveloperSigningCredential(); // developer signing key generálás, nem kell verziókezelni, mindig létrejön magától, hogyha nincs
            else
                throw new Exception("need to configure key material");
            
            services.AddAuthentication(o =>
                {
                    o.DefaultScheme = IdentityServerAuthenticationDefaults.AuthenticationScheme;
                    o.DefaultAuthenticateScheme = IdentityServerAuthenticationDefaults.AuthenticationScheme;
                    o.DefaultForbidScheme = IdentityServerAuthenticationDefaults.AuthenticationScheme;
                    o.DefaultChallengeScheme = IdentityServerAuthenticationDefaults.AuthenticationScheme;
                })
                .AddIdentityServerAuthentication(options =>
                {
                    options.Authority =
                        $"https://{Configuration["ApplicationHost"]}:{Configuration["ApplicationHttpsPort"]}";
                    options.SupportedTokens = SupportedTokens.Jwt;
                    options.RequireHttpsMetadata = false; // Note: Set to true in production
                    options.ApiName = IdentityConfigConstants.ApiName;
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];

                            // If the request is for our hub...
                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken))
                            {
                                // Read the token out of the query string
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });

            services.AddAuthorization(options =>
            {
                options.AddPolicyWithAdmin(ApplicationPermissions.ViewUsers);
                options.AddPolicyWithAdmin(ApplicationPermissions.AddUsers);
                options.AddPolicyWithAdmin(ApplicationPermissions.UpdateUsers);
                options.AddPolicyWithAdmin(ApplicationPermissions.DeleteUsers);

                options.AddPolicyWithAdmin(ApplicationPermissions.ViewRoles);
                options.AddPolicyWithAdmin(ApplicationPermissions.AddRoles);
                options.AddPolicyWithAdmin(ApplicationPermissions.UpdateRoles);
                options.AddPolicyWithAdmin(ApplicationPermissions.DeleteRoles);

                options.AddPolicyWithAdmin(ApplicationPermissions.ViewAbout);

            });

            services.AddCors(options =>
            {
                // this defines a CORS policy called "default"
                options.AddPolicy("default", policy =>
                {
                    policy.WithOrigins("https://localhost:44301")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo {Title = IdentityConfigConstants.ApiFriendlyName, Version = "v1"});
                c.OperationFilter<AuthorizeCheckOperationFilter>();
                c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.OAuth2,
                    Flows = new OpenApiOAuthFlows
                    {
                        Password = new OpenApiOAuthFlow
                        {
                            TokenUrl = new Uri("/connect/token", UriKind.Relative),
                            Scopes = new Dictionary<string, string>
                            {
                                {IdentityConfigConstants.ApiName, IdentityConfigConstants.ApiFriendlyName}
                            }
                        }
                    }
                });
            });

            services.AddAutoMapper(typeof(Startup));

            // Configurations
            services.Configure<AppSettings>(Configuration);

            //// Business Services // TODO Implement
            //services.AddScoped<IEmailSender, EmailSender>();

            services.AddScoped<IAccountManager, AccountManager>();

            // DB Creation and Seeding
            services.AddTransient<IDatabaseInitializer, DatabaseInitializer>();

            services.AddSingleton<IUserIdProvider, NameUserIdProvider>();

            //services.AddTransient<IPersistedGrantStore, PersistedGrantStore>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            //Utilities.ConfigureLogger(loggerFactory);
            //EmailTemplates.Initialize(env);

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseRouting();

            // add middleware to translate the query string token 
            // passed by SignalR into an Authorization Bearer header
            app.UseJwtSignalRAuthentication();
            app.UseCors("default");

            app.UseIdentityServer();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.DocumentTitle = "Swagger UI - Schwarzenegger";
                c.SwaggerEndpoint("/swagger/v1/swagger.json", $"{IdentityConfigConstants.ApiFriendlyName} V1");
                c.OAuthClientId(IdentityConfigConstants.SwaggerClientId);
                c.OAuthClientSecret("no_password"); //Leaving it blank doesn't work
            });

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<MainHub>("/mainHub", options =>
                {
                    options.Transports = HttpTransportType.WebSockets;
                });
            });
        }
    }
}