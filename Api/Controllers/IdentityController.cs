using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // TODO Ha meghívom a böngészőben a localhost:44301/api/identity-t, akkor 401-et kell kapni (Unauthorized) -> Működik az API protection
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