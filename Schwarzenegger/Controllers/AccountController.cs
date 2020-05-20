using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Schwarzenegger.Core.Authorization;
using Schwarzenegger.Core.Helpers;
using Schwarzenegger.Core.Interfaces;
using Schwarzenegger.Core.Models;
using Schwarzenegger.Enums;
using Schwarzenegger.Hubs;
using Schwarzenegger.ViewModels;

namespace Schwarzenegger.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    // [ApiExplorerSettings(IgnoreApi = true)]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountManager _accountManager;
        private readonly IMapper _mapper;
        private readonly IHubContext<MainHub> _hubContext;

        public AccountController(IMapper mapper, IAccountManager accountManager, IHubContext<MainHub> hubContext)
        {
            _mapper = mapper;
            _accountManager = accountManager;
            _hubContext = hubContext;
        }


        [HttpGet("users/me")]
        [ProducesResponseType(200, Type = typeof(UserViewModel))]
        [Obsolete("Használaton kívül")]
        public async Task<IActionResult> GetCurrentUser()
        {
            return await GetUserById(Utilities.GetUserId(User));
        }


        [HttpGet("users/{id}")]
        [ProducesResponseType(200, Type = typeof(UserViewModel))]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        [Authorize(ApplicationPermissions.ViewUsersPolicy)]
        [Obsolete("Használaton kívül")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var userVm = await GetUserViewModelHelper(id);

            if (userVm != null)
                return Ok(userVm);
            return NotFound(id);
        }
        
        [HttpGet("users")]
        [Authorize(ApplicationPermissions.ViewUsersPolicy)]
        [ProducesResponseType(200, Type = typeof(List<UserViewModel>))]
        public async Task<IActionResult> GetUsers()
        {
            return await GetUsers(-1, -1);
        }


        [HttpGet("users/{pageNumber:int}/{pageSize:int}")]
        [Authorize(ApplicationPermissions.ViewUsersPolicy)]
        [ProducesResponseType(200, Type = typeof(List<UserViewModel>))]
        public async Task<IActionResult> GetUsers(int pageNumber, int pageSize)
        {
            var usersAndRoles = await _accountManager.GetUsersAndRolesAsync(pageNumber, pageSize);

            var usersVm = new List<UserViewModel>();

            foreach (var item in usersAndRoles)
            {
                var userVm = _mapper.Map<UserViewModel>(item.User);
                userVm.Roles = item.Roles;
                userVm.Claims = item.Claims;

                usersVm.Add(userVm);
            }

            return Ok(usersVm);
        }
        
        [HttpPut("users")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        [Authorize(ApplicationPermissions.UpdateUsersPolicy)]
        public async Task<IActionResult> UpdateUser([FromForm]string key, [FromForm]string values)
        {
            var (newValues, roles) = DeattachRoles(values);

            var appUser = await _accountManager.GetUserByIdAsync(key);
            var currentRoles = appUser != null ? (await _accountManager.GetUserRolesAsync(appUser)).ToArray() : null;

            if (appUser == null)
            {
                return NotFound(new { Message = "User cannot be found" });
            }

            JsonConvert.PopulateObject(newValues, appUser);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (succeeded, errors) = await _accountManager.UpdateUserAsync(appUser, roles ?? currentRoles);
            if (succeeded)
            {
                await _hubContext.Clients.User(appUser.Id)
                    .SendAsync(WebsocketMethodType.ForceRefreshToken.ToString("D"));
                return Ok();
            }

            AddError(errors);

            return BadRequest(ModelState);
        }

        [HttpPost("users/changepassword")]
        [Authorize(ApplicationPermissions.UpdateUsersPolicy)]
        public async Task<IActionResult> ResetPasswordAsync([FromBody] NewPasswordObj newPasswordObj)
        {
            var appUser = await _accountManager.GetUserByIdAsync(newPasswordObj.UserId);
            var (succeeded, errors) = await _accountManager.ResetPasswordAsync(appUser, newPasswordObj.NewPassword);

            if (succeeded)
            {
                return Ok();
            }

            AddError(errors);
            return BadRequest(ModelState);
        }
        
        [HttpPost("users")]
        [ProducesResponseType(201, Type = typeof(UserViewModel))]
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        [Authorize(ApplicationPermissions.AddUsersPolicy)]
        public async Task<IActionResult> Register([FromBody] InsertUserViewModel user)
        {
            if (!TryValidateModel(user, nameof(UserEditViewModel)))
            {
                return BadRequest(ModelState);
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (user == null)
                return BadRequest($"{nameof(user)} cannot be null");
            
            var appUser = _mapper.Map<ApplicationUser>(user);

            var (succeeded, errors) = await _accountManager.CreateUserAsync(appUser, user.Roles, user.NewPassword);
            if (succeeded)
            {
                var userVm = await GetUserViewModelHelper(appUser.Id);
                return Ok(userVm);
            }

            AddError(errors);

            return BadRequest(ModelState);
        }


        [HttpDelete("users/{id}")]
        [ProducesResponseType(200, Type = typeof(UserViewModel))]
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        [Authorize(ApplicationPermissions.DeleteUsersPolicy)]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var appUser = await _accountManager.GetUserByIdAsync(id);

            if (appUser == null)
                return NotFound(id);

            if (!await _accountManager.TestCanDeleteUserAsync(id))
                return BadRequest("User cannot be deleted. Delete all orders associated with this user and try again");


            var userVm = await GetUserViewModelHelper(appUser.Id);

            var (succeeded, errors) = await _accountManager.DeleteUserAsync(appUser);
            if (!succeeded)
            {
                return BadRequest(errors);
            }

            await _hubContext.Clients.User(id)
                .SendAsync(WebsocketMethodType.ForceLogout.ToString("D"));

            return Ok(userVm);
        }

        [HttpGet("users/me/preferences")]
        [ProducesResponseType(200, Type = typeof(string))]
        [Obsolete("Használaton kívül")]
        public async Task<IActionResult> UserPreferences()
        {
            var userId = Utilities.GetUserId(User);
            var appUser = await _accountManager.GetUserByIdAsync(userId);

            return Ok(appUser.Configuration);
        }


        [HttpPut("users/me/preferences")]
        [ProducesResponseType(204)]
        [Obsolete("Használaton kívül")]
        public async Task<IActionResult> UserPreferences([FromBody] string data)
        {
            var userId = Utilities.GetUserId(User);
            var appUser = await _accountManager.GetUserByIdAsync(userId);

            appUser.Configuration = data;

            var result = await _accountManager.UpdateUserAsync(appUser);
            if (!result.Succeeded)
                throw new Exception("The following errors occurred whilst updating User Configurations: " +
                                    string.Join(", ", result.Errors));

            return NoContent();
        }

        private async Task<UserViewModel> GetUserViewModelHelper(string userId)
        {
            var userAndRoles = await _accountManager.GetUserAndRolesAsync(userId);
            if (userAndRoles == null)
                return null;

            var userVm = _mapper.Map<UserViewModel>(userAndRoles.Value.User);
            userVm.Roles = userAndRoles.Value.Roles;

            return userVm;
        }

        private void AddError(IEnumerable<string> errors, string key = "")
        {
            foreach (var error in errors) AddError(error, key);
        }

        private void AddError(string error, string key = "")
        {
            ModelState.AddModelError(key, error);
        }

        private (string, string[]) DeattachRoles(string values)
        {
            var json = JsonConvert.DeserializeObject<JObject>(values);

            if (!json.ContainsKey("roles"))
            {
                return (json.ToString(), null);
            }

            var roles = json.GetValue("roles").ToObject<string[]>();
            json.Remove("roles");

            return (json.ToString(), roles);
        }
    }
}