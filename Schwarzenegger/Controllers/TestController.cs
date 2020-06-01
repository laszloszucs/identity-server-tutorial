using System.Linq;
using Microsoft.AspNetCore.Mvc;

namespace Schwarzenegger.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class TestController : ControllerBase
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