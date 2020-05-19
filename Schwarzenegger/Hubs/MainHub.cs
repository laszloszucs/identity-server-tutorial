using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Schwarzenegger.Enums;

namespace Schwarzenegger.Hubs
{
    [Authorize]
    public class MainHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, WebsocketMethodType.Message, message);
        }
    }
}
