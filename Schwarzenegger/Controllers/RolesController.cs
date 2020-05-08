using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Schwarzenegger.Core.Authorization;
using Schwarzenegger.Core.DAL;
using Schwarzenegger.Core.Interfaces;
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

        public RolesController(ApplicationDbContext context, IMapper mapper, IAccountManager accountManager)
        {
            _context = context;
            _mapper = mapper;
            _accountManager = accountManager;
        }

        [HttpGet]
        [Authorize(Policies.ViewAllRolesPolicy)]
        public async Task<IActionResult> GetAsync()
        {
            var roles = await _context.Roles.Include(r => r.Users).Include(r => r.Claims).ToListAsync();
            return Ok(_mapper.Map<List<RoleViewModel>>(roles));
            //return roles;
            //var dtos = _mapper.Map<IEnumerable<IdentityRole>>(roles);
            //return dtos;
        }

        [HttpPut]
        [Authorize(Policies.ManageAllRolesPolicy)]
        public async Task<IActionResult> PutAsync([FromForm]string key, [FromForm]string values)
        {
            var (newValues, permissions) = DeattachPermissions(values);
            var appRole = await _accountManager.GetRoleByIdAsync(key);
            //var currentPermissions = appRole != null ? (await _accountManager.GetPermissions(appRole)).ToArray() : null;

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
                return Ok();

            AddError(errors);

            return BadRequest(ModelState);

        }

        [HttpGet("claims")]
        [Authorize(Policies.ViewAllRolesPolicy)]
        public IActionResult Claims()
        {
            var claims = ApplicationPermissions.AllPermissions;
            return Ok(claims);
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
    }
}