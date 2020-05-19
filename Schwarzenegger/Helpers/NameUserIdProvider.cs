using System.Linq;
using Microsoft.AspNetCore.SignalR;

namespace Schwarzenegger.Helpers
{
    public class NameUserIdProvider : IUserIdProvider
    {
        public string GetUserId(HubConnectionContext connection)
        {
            return connection.User?.Claims.First(c => c.Type == "sub").Value;
        }
    }
}
