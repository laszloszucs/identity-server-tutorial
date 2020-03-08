using System;
using System.Collections.Generic;
using AutoMapper;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Schwarzenegger.Core;
using Schwarzenegger.Core.Authorization;
using Schwarzenegger.Core.DAL;
using Schwarzenegger.Core.DAL.Interfaces;
using Schwarzenegger.Core.Interfaces;
using Schwarzenegger.Core.Models;
using Schwarzenegger.Helpers;

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

            var builder = services.AddIdentityServer()
                .AddDeveloperSigningCredential()
                .AddInMemoryPersistedGrants()
                .AddInMemoryIdentityResources(Config
                    .GetIdentityResources()) // TODO https://localhost:44300/.well-known/openid-configuration
                .AddInMemoryApiResources(Config
                    .GetApis()) // Itt töltődnek be az Resource-ok (API-k, amiket védeni kell)
                .AddInMemoryClients(Config.GetClients()) // és a Client-ek, melyek a megbízható alkalmazások
                .AddAspNetIdentity<ApplicationUser>()
                .AddProfileService<ProfileService>();

            if (Environment.IsDevelopment())
                builder
                    .AddDeveloperSigningCredential(); // developer signing key generálás, nem kell verziókezelni, mindig létrejön magától, hogyha nincs
            else
                throw new Exception("need to configure key material");

            services.AddAuthentication(IdentityServerAuthenticationDefaults.AuthenticationScheme)
                .AddIdentityServerAuthentication(options =>
                {
                    options.Authority =
                        $"https://{Configuration["ApplicationHost"]}:{Configuration["ApplicationHttpsPort"]}"; // new Uri("", UriKind.Relative).ToString();
                    options.SupportedTokens = SupportedTokens.Jwt;
                    options.RequireHttpsMetadata = false; // Note: Set to true in production
                    options.ApiName = IdentityConfigConstants.ApiName;
                });

            services.AddAuthorization(options =>
            {
                options.AddPolicy(Policies.ViewAllUsersPolicy,
                    policy => policy.RequireClaim(ClaimConstants.Permission, ApplicationPermissions.ViewUsers));
                options.AddPolicy(Policies.ManageAllUsersPolicy,
                    policy => policy.RequireClaim(ClaimConstants.Permission, ApplicationPermissions.ManageUsers));

                options.AddPolicy(Policies.ViewAllRolesPolicy,
                    policy => policy.RequireClaim(ClaimConstants.Permission, ApplicationPermissions.ViewRoles));
                options.AddPolicy(Policies.ViewRoleByRoleNamePolicy,
                    policy => policy.Requirements.Add(new ViewRoleAuthorizationRequirement()));
                options.AddPolicy(Policies.ManageAllRolesPolicy,
                    policy => policy.RequireClaim(ClaimConstants.Permission, ApplicationPermissions.ManageRoles));

                options.AddPolicy(Policies.AssignAllowedRolesPolicy,
                    policy => policy.Requirements.Add(new AssignRolesAuthorizationRequirement()));
            });

            //services.AddCors(options =>
            //{
            //    // this defines a CORS policy called "default"
            //    options.AddPolicy("default", policy =>
            //    {
            //        policy.WithOrigins("https://localhost:44301")
            //            .AllowAnyHeader()
            //            .AllowAnyMethod();
            //    });
            //});

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

            // Repositories
            //services.AddScoped<IUnitOfWork, HttpUnitOfWork>();
            services.AddScoped<IAccountManager, AccountManager>();

            // Auth Handlers
            services.AddSingleton<IAuthorizationHandler, ViewUserAuthorizationHandler>();
            services.AddSingleton<IAuthorizationHandler, ManageUserAuthorizationHandler>();
            services.AddSingleton<IAuthorizationHandler, ViewRoleAuthorizationHandler>();
            services.AddSingleton<IAuthorizationHandler, AssignRolesAuthorizationHandler>();

            // DB Creation and Seeding
            services.AddTransient<IDatabaseInitializer, DatabaseInitializer>();
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

            //app.UseCors("default");

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

            app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
        }
    }
}