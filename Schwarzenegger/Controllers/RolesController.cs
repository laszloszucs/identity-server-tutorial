using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Schwarzenegger.Core.Authorization;
using Schwarzenegger.Core.DAL;
using Schwarzenegger.Core.Interfaces;
using Schwarzenegger.Core.Models;
using Schwarzenegger.Enums;
using Schwarzenegger.Hubs;
using Schwarzenegger.ViewModels;

namespace Schwarzenegger.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RolesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IAccountManager _accountManager;
        private readonly IHubContext<MainHub> _hubContext;

        public RolesController(ApplicationDbContext context, IMapper mapper, IAccountManager accountManager, IHubContext<MainHub> hubContext)
        {
            _context = context;
            _mapper = mapper;
            _accountManager = accountManager;
            _hubContext = hubContext;
        }

        [HttpGet]
        [Authorize(ApplicationPermissions.ViewRolesPolicy)]
        public async Task<IActionResult> GetAsync()
        {
            var roles = await _context.Roles.Include(r => r.Users).Include(r => r.Claims).ToListAsync();
            return Ok(_mapper.Map<List<RoleViewModel>>(roles));
        }
        
        [HttpPost]
        [ProducesResponseType(201, Type = typeof(RoleViewModel))]
        [ProducesResponseType(400)]
        [Authorize(ApplicationPermissions.AddRolesPolicy)]
        public async Task<IActionResult> PostAsync([FromBody] RoleViewModel role)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (role == null)
                return BadRequest($"{nameof(role)} cannot be null");


            var appRole = _mapper.Map<ApplicationRole>(role);

            var (succeeded, errors) =
                await _accountManager.CreateRoleAsync(appRole, role.Permissions);
            if (!succeeded)
            {
                AddError(errors);

                return BadRequest(ModelState);
            }

            var roleVm = await GetRoleViewModelHelper(appRole.Name);
            return Ok(roleVm);
        }

        [HttpPut]
        [Authorize(ApplicationPermissions.UpdateRolesPolicy)]
        public async Task<IActionResult> PutAsync([FromForm]string key, [FromForm]string values)
        {
            var (newValues, permissions) = DeattachPermissions(values);
            var appRole = await _accountManager.GetRoleByIdAsync(key);

            if (appRole == null)
            {
                return NotFound(new { Message = "Role cannot be found" });
            }

            JsonConvert.PopulateObject(newValues, appRole);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (succeeded, errors) = await _accountManager.UpdateRoleAsync(appRole, permissions ?? appRole.Claims.Select(c => c.ClaimValue));
            if (succeeded)
            {
                var usersAndRoles = await _accountManager.GetUsersAndRolesAsync();
                var relevantUsers = usersAndRoles.Where(u => !u.User.IsAdmin && u.Roles.Contains(appRole.Name));

                foreach (var relevantUser in relevantUsers)
                {
                    await _hubContext.Clients.User(relevantUser.User.Id)
                        .SendAsync(WebsocketMethodType.ForceRefreshToken.ToString("D"));
                }

                return Ok();
            }

            AddError(errors);

            return BadRequest(ModelState);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(200, Type = typeof(RoleViewModel))]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [Authorize(ApplicationPermissions.DeleteRolesPolicy)]
        public async Task<IActionResult> DeleteRole(string id)
        {
            var appRole = await _accountManager.GetRoleByIdAsync(id);

            if (appRole == null)
                return NotFound(id);

            if (!await _accountManager.TestCanDeleteRoleAsync(id))
                return BadRequest("Role cannot be deleted. Remove all users from this role and try again");


            var roleVm = await GetRoleViewModelHelper(appRole.Name);

            var usersAndRoles = await _accountManager.GetUsersAndRolesAsync();
            var relevantUsers = usersAndRoles.Where(u => !u.User.IsAdmin && u.Roles.Contains(appRole.Name));

            var (succeeded, errors) = await _accountManager.DeleteRoleAsync(appRole);
            if (!succeeded)
            {
                return BadRequest(errors);
            }

            foreach (var relevantUser in relevantUsers)
            {
                await _hubContext.Clients.User(relevantUser.User.Id)
                    .SendAsync(WebsocketMethodType.ForceRefreshToken.ToString("D"));
            }

            return Ok(roleVm);
        }

        private void AddError(IEnumerable<string> errors, string key = "")
        {
            foreach (var error in errors) AddError(error, key);
        }

        private void AddError(string error, string key = "")
        {
            ModelState.AddModelError(key, error);
        }

        private (string, string[]) DeattachPermissions(string values)
        {
            var json = JsonConvert.DeserializeObject<JObject>(values);

            if (!json.ContainsKey("permissions"))
            {
                return (json.ToString(), null);
            }

            var permissions = json.GetValue("permissions").ToObject<string[]>();
            json.Remove("permissions");

            return (json.ToString(), permissions);
        }

        private async Task<RoleViewModel> GetRoleViewModelHelper(string roleName)
        {
            var role = await _accountManager.GetRoleLoadRelatedAsync(roleName);
            if (role != null)
                return _mapper.Map<RoleViewModel>(role);


            return null;
        }
    }
}