using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Schwarzenegger.Core.Authorization;
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
            await _context.Database.EnsureCreatedAsync().ConfigureAwait(false);
            await SeedAsync();
        }

        public async Task SeedAsync()
        {
            //await _context.Database.MigrateAsync().ConfigureAwait(false); // TODO Megvizsgálni, hogy fel lehet-e okosan használni

            const string adminRoleName = "administrator";
            if (!await _context.Users.AnyAsync())
            {
                _logger.LogInformation("Generating inbuilt accounts");

                const string userRoleName = "user";

                await EnsureRoleAsync(adminRoleName, "Default administrator",
                    ApplicationPermissions.GetAllPermissionValues());
                await EnsureRoleAsync(userRoleName, "Default user", new string[] { });

                await CreateUserAsync("admin", "tempP@ss123", "Inbuilt Administrator", "admin@ebenmonney.com",
                    "+1 (123) 000-0000", new[] {adminRoleName});
                await CreateUserAsync("user", "tempP@ss123", "Inbuilt Standard User", "user@ebenmonney.com",
                    "+1 (123) 000-0001", new[] {userRoleName});

                await _context.SaveChangesAsync();

                _logger.LogInformation("Inbuilt account generation completed");
            }
            else
            {
                _logger.LogInformation("Update administrator Role Claims");
                await UpdateRoleClaimsAsync(adminRoleName, "Default administrator",
                    ApplicationPermissions.GetAllPermissionValues());

                await _context.SaveChangesAsync();

            }
        }
        private async Task UpdateRoleClaimsAsync(string roleName, string description, string[] claims)
        {
            var applicationRole = await _accountManager.GetRoleByNameAsync(roleName);

            var result = await _accountManager.UpdateRoleAsync(applicationRole, claims);

            if (!result.Succeeded)
                throw new Exception(
                    $"Seeding \"{description}\" role failed. Errors: {string.Join(Environment.NewLine, result.Errors)}");
        }

        private async Task EnsureRoleAsync(string roleName, string description, string[] claims)
        {
            if (await _accountManager.GetRoleByNameAsync(roleName) == null)
            {
                var applicationRole = new ApplicationRole(roleName, description);

                var result = await _accountManager.CreateRoleAsync(applicationRole, claims);

                if (!result.Succeeded)
                    throw new Exception(
                        $"Seeding \"{description}\" role failed. Errors: {string.Join(Environment.NewLine, result.Errors)}");
            }
        }

        private async Task<ApplicationUser> CreateUserAsync(string userName, string password, string fullName,
            string email, string phoneNumber, string[] roles)
        {
            var applicationUser = new ApplicationUser
            {
                UserName = userName,
                FullName = fullName,
                Email = email,
                PhoneNumber = phoneNumber,
                EmailConfirmed = true,
                IsEnabled = true
            };

            var result = await _accountManager.CreateUserAsync(applicationUser, roles, password);

            if (!result.Succeeded)
                throw new Exception(
                    $"Seeding \"{userName}\" user failed. Errors: {string.Join(Environment.NewLine, result.Errors)}");


            return applicationUser;
        }
    }
}