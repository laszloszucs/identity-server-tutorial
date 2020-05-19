using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using IdentityServer4.EntityFramework.DbContexts;
using IdentityServer4.EntityFramework.Mappers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Schwarzenegger.Core.DAL.Interfaces;
using Schwarzenegger.Core.Interfaces;
using Schwarzenegger.Core.Models;
using Schwarzenegger.Helpers;
using System.Linq;

namespace Schwarzenegger.Core.DAL
{
    public class DatabaseInitializer : IDatabaseInitializer
    {
        private readonly IAccountManager _accountManager;
        private readonly ApplicationDbContext _context;
        private readonly ILogger _logger;
        private readonly PersistedGrantDbContext _persistedGrantDbContext;
        private readonly ConfigurationDbContext _configurationDbContext;
        private readonly IOptions<AppSettings> _appSettings;

        public DatabaseInitializer(ApplicationDbContext context, IAccountManager accountManager,
            ILogger<DatabaseInitializer> logger, PersistedGrantDbContext persistedGrantDbContext,
            ConfigurationDbContext configurationDbContext, IOptions<AppSettings> appSettings)
        {
            _accountManager = accountManager;
            _context = context;
            _logger = logger;
            _persistedGrantDbContext = persistedGrantDbContext;
            _configurationDbContext = configurationDbContext;
            _appSettings = appSettings;
        }

        public async Task InitializeAsync()
        {
            // await _context.Database.EnsureDeletedAsync();
            await _context.Database.EnsureCreatedAsync().ConfigureAwait(false);
            // InitializeTokenServerConfigurationDatabase();
            await SeedAsync();
        }

        public async Task SeedAsync()
        {
            //await _context.Database.MigrateAsync().ConfigureAwait(false); // TODO Megvizsgálni, hogy fel lehet-e okosan használni

            const string operatorRoleName = "operator";
            if (!await _context.Users.AnyAsync())
            {
                _logger.LogInformation("Generating inbuilt accounts");

                const string userRoleName = "user";

                await EnsureRoleAsync(operatorRoleName, "Operator", new[] {"users.view", "roles.view", "about.view"});
                await EnsureRoleAsync(userRoleName, "User", new[] {"about.view"});

                await CreateUserAsync("admin", "tempP@ss123", "Inbuilt Administrator", "admin@schwarzenegger.com",
                    "+1 (123) 000-0000", new[] {operatorRoleName}, true);
                await CreateUserAsync("user", "tempP@ss123", "Inbuilt Standard User", "user@schwarzenegger.com",
                    "+1 (123) 000-0001", new[] {userRoleName});

                await _context.SaveChangesAsync();

                _logger.LogInformation("Inbuilt account generation completed");
            }
        }

        private async Task EnsureRoleAsync(string roleName, string description, IEnumerable<string> claims)
        {
            if (await _accountManager.GetRoleByNameAsync(roleName) == null)
            {
                var applicationRole = new ApplicationRole(roleName, description);

                var (succeeded, errors) = await _accountManager.CreateRoleAsync(applicationRole, claims);

                if (!succeeded)
                    throw new Exception(
                        $"Seeding \"{description}\" role failed. Errors: {string.Join(Environment.NewLine, errors)}");
            }
        }

        private async Task CreateUserAsync(string userName, string password, string fullName,
            string email, string phoneNumber, IEnumerable<string> roles, bool isAdmin = false)
        {
            var applicationUser = new ApplicationUser
            {
                UserName = userName,
                FullName = fullName,
                Email = email,
                PhoneNumber = phoneNumber,
                EmailConfirmed = true,
                IsEnabled = true,
                IsAdmin = isAdmin
            };

            var (succeeded, errors) = await _accountManager.CreateUserAsync(applicationUser, roles, password);

            if (!succeeded)
                throw new Exception(
                    $"Seeding \"{userName}\" user failed. Errors: {string.Join(Environment.NewLine, errors)}");
        }

        private void InitializeTokenServerConfigurationDatabase()
        {
                _persistedGrantDbContext.Database.Migrate();
                _configurationDbContext.Database.Migrate();

            if (!_configurationDbContext.Clients.Any())
                {
                    foreach (var client in IdentityServerConfig.GetClients(_appSettings.Value.AllowedCorsOrigins))
                    {
                        _configurationDbContext.Clients.Add(client.ToEntity());
                    }

                    _configurationDbContext.SaveChanges();
                }

                if (!_configurationDbContext.IdentityResources.Any())
                {
                    foreach (var resource in IdentityServerConfig.GetIdentityResources())
                    {
                        _configurationDbContext.IdentityResources.Add(resource.ToEntity());
                    }

                    _configurationDbContext.SaveChanges();
                }

                if (_configurationDbContext.ApiResources.Any())
                {
                    return;
                }

                foreach (var resource in IdentityServerConfig.GetApis())
                {
                    _configurationDbContext.ApiResources.Add(resource.ToEntity());
                }

                _configurationDbContext.SaveChanges();
        }
    }
}
        