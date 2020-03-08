using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Schwarzenegger.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // TODO Ha meghívom a böngészőben a localhost:44300/api/identity-t, akkor 401-et kell kapni (Unauthorized) -> Működik az API protection
    //[Authorize(AuthenticationSchemes = IdentityServerAuthenticationDefaults.AuthenticationScheme)]
    public class IdentityController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return new JsonResult(
                User.Claims.Select(claim => new
                {
                    claim.Type,
                    claim.Value
                }));
        }
    }
}