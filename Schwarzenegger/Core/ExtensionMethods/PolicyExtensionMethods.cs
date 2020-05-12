using Microsoft.AspNetCore.Authorization;
using Schwarzenegger.Core.Authorization;

namespace Schwarzenegger.Core.ExtensionMethods
{
    public static class PolicyExtensionMethods
    {
        public static void AddPolicyWithAdmin(this AuthorizationOptions options, ApplicationPermission applicationPermission)
        {
            options.AddPolicy(applicationPermission.Name, policy =>
                policy.RequireAssertion(context =>
                    context.User.HasClaim(c =>
                        (c.Type == ClaimConstants.Permission && c.Value == applicationPermission)
                        || c.Type == PropertyConstants.IsAdmin && c.Value == "true")));

            // TODO c.Issuer == "https://microsoftsecurity" Kell Issuer ??? bár szerintem ezt alapból már kezeli az Identity Server
        }
    }
}
