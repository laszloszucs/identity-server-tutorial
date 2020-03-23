using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Schwarzenegger.Core.DAL.Interfaces;
using Schwarzenegger.Core.Interfaces;
using Schwarzenegger.Core.Models;

namespace Schwarzenegger.Core.DAL
{
    public class DatabaseInitializer : IDatabaseInitializer
    {
        private readonly IAccountManager _accountManager;
        private readonly ApplicationDbContext _context;
        private readonly ILogger _logger;

        public DatabaseInitializer(ApplicationDbContext context, IAccountManager accountManager,
            ILogger<DatabaseInitializer> logger)
        {
            _accountManager = accountManager;
            _context = context;
            _logger = logger;
        }

        public async Task InitializeAsync()
        {
            //await _context.Database.EnsureDeletedAsync();
            await _context.Database.EnsureCreatedAsync().ConfigureAwait(false);
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

                await EnsureRoleAsync(operatorRoleName, "Operator", new[] { "home.view", "account.view" });
                await EnsureRoleAsync(userRoleName, "User", new [] { "home.view", "account.view", "roles.view" });

                await CreateUserAsync("admin", "tempP@ss123", "Inbuilt Administrator", "admin@schwarzenegger.com",
                    "+1 (123) 000-0000", new[] { operatorRoleName }, true);
                await CreateUserAsync("user", "tempP@ss123", "Inbuilt Standard User", "user@schwarzenegger.com",
                    "+1 (123) 000-0001", new[] { userRoleName });

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
    }
}