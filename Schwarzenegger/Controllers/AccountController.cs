using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Schwarzenegger.Core.Authorization;
using Schwarzenegger.Core.Helpers;
using Schwarzenegger.Core.Interfaces;
using Schwarzenegger.Core.Models;
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

        public AccountController(IMapper mapper, IAccountManager accountManager)
        {
            _mapper = mapper;
            _accountManager = accountManager;
        }


        [HttpGet("users/me")]
        [ProducesResponseType(200, Type = typeof(UserViewModel))]
        public async Task<IActionResult> GetCurrentUser()
        {
            return await GetUserById(Utilities.GetUserId(User));
        }


        [HttpGet("users/{id}")]
        [ProducesResponseType(200, Type = typeof(UserViewModel))]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        [Authorize(ApplicationPermissions.ViewUsersPolicy)]
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


        //[HttpPut("users/me")]
        //[ProducesResponseType(204)]
        //[ProducesResponseType(400)]
        //[ProducesResponseType(403)]
        //[Authorize(ApplicationPermissions.UpdateUsersPolicy)]
        //public async Task<IActionResult> UpdateCurrentUser([FromBody] UserEditViewModel user)
        //{
        //    return await UpdateUser(Utilities.GetUserId(User), user);
        //}

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
                (succeeded, errors) = await _accountManager.RemoveTokenAsync(appUser);
                if (succeeded)
                {
                    return Ok();
                }
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

        //[HttpPut("users/{id}")]
        //[ProducesResponseType(204)]
        //[ProducesResponseType(400)]
        //[ProducesResponseType(403)]
        //[ProducesResponseType(404)]
        //[Authorize(ApplicationPermissions.UpdateUsersPolicy)]
        //public async Task<IActionResult> UpdateUser(string id, [FromBody] UserEditViewModel user)
        //{
        //    var appUser = await _accountManager.GetUserByIdAsync(id);

        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    if (user == null)
        //        return BadRequest($"{nameof(user)} cannot be null");

        //    if (!string.IsNullOrWhiteSpace(user.Id) && id != user.Id)
        //        return BadRequest("Conflicting user id in parameter and model data");

        //    if (appUser == null)
        //        return NotFound(id);

        //    var isPasswordChanged = !string.IsNullOrWhiteSpace(user.NewPassword);
        //    var isUserNameChanged = !appUser.UserName.Equals(user.UserName, StringComparison.OrdinalIgnoreCase);

        //    if (Utilities.GetUserId(User) == id)
        //    {
        //        if (string.IsNullOrWhiteSpace(user.CurrentPassword))
        //        {
        //            if (isPasswordChanged)
        //                AddError("Current password is required when changing your own password", "Password");

        //            if (isUserNameChanged)
        //                AddError("Current password is required when changing your own username", "Username");
        //        }
        //        else if (isPasswordChanged || isUserNameChanged)
        //        {
        //            if (!await _accountManager.CheckPasswordAsync(appUser, user.CurrentPassword))
        //                AddError("The username/password couple is invalid.");
        //        }
        //    }

        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    _mapper.Map(user, appUser);

        //    //var result = await _accountManager.UpdateUserAsync(appUser, user.Roles);
        //    var (succeeded, errors) = await _accountManager.UpdateUserAsync(appUser);
        //    if (succeeded)
        //    {
        //        (succeeded, errors) = await _accountManager.RemoveTokenAsync(appUser);
        //        if (succeeded)
        //        {
        //            if (isPasswordChanged)
        //            {
        //                if (!string.IsNullOrWhiteSpace(user.CurrentPassword))
        //                    (succeeded, errors) = await _accountManager.UpdatePasswordAsync(appUser, user.CurrentPassword,
        //                        user.NewPassword);
        //                else
        //                    (succeeded, errors) = await _accountManager.ResetPasswordAsync(appUser, user.NewPassword);
        //            }

        //            if (succeeded)
        //                return Ok();
        //        }
        //    }
            
        //    AddError(errors);

        //    return BadRequest(ModelState);
        //}


        //[HttpPatch("users/me")]
        //[ProducesResponseType(204)]
        //[ProducesResponseType(400)]
        //[Authorize(ApplicationPermissions.UpdateUsersPolicy)]
        //public async Task<IActionResult> UpdateCurrentUser([FromBody] JsonPatchDocument<UserPatchViewModel> patch)
        //{
        //    return await UpdateUser(Utilities.GetUserId(User), patch);
        //}


        //[HttpPatch("users/{id}")]
        //[ProducesResponseType(204)]
        //[ProducesResponseType(400)]
        //[ProducesResponseType(403)]
        //[ProducesResponseType(404)]
        //[Authorize(ApplicationPermissions.UpdateUsersPolicy)]
        //public async Task<IActionResult> UpdateUser(string id, [FromBody] JsonPatchDocument<UserPatchViewModel> patch)
        //{
        //    if (ModelState.IsValid)
        //    {
        //        if (patch == null)
        //            return BadRequest($"{nameof(patch)} cannot be null");


        //        var appUser = await _accountManager.GetUserByIdAsync(id);

        //        if (appUser == null)
        //            return NotFound(id);


        //        var userPvm = _mapper.Map<UserPatchViewModel>(appUser);
        //        patch.ApplyTo(userPvm, e => AddError(e.ErrorMessage));

        //        if (!ModelState.IsValid)
        //        {
        //            return BadRequest(ModelState);
        //        }

        //        _mapper.Map(userPvm, appUser);

        //        var (succeeded, errors) = await _accountManager.UpdateUserAsync(appUser);
        //        if (succeeded)
        //        {
        //            (succeeded, errors) = await _accountManager.RemoveTokenAsync(appUser);
        //            if (succeeded)
        //            {
        //                return Ok();
        //            }
        //        }
                
        //        AddError(errors);
        //    }

        //    return BadRequest(ModelState);
        //}


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
                throw new Exception("The following errors occurred whilst deleting user: " +
                                    string.Join(", ", errors));

            return Ok(userVm);
        }

        [HttpGet("users/me/preferences")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> UserPreferences()
        {
            var userId = Utilities.GetUserId(User);
            var appUser = await _accountManager.GetUserByIdAsync(userId);

            return Ok(appUser.Configuration);
        }


        [HttpPut("users/me/preferences")]
        [ProducesResponseType(204)]
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