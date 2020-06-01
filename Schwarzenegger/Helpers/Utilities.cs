using System.Security.Claims;
using IdentityModel;

namespace Schwarzenegger.Helpers
{
    public static class Utilities
    {
        public static string GetUserId(ClaimsPrincipal user)
        {
            return user.FindFirst(JwtClaimTypes.Subject)?.Value?.Trim();
        }
    }
}