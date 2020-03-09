using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Schwarzenegger.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
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