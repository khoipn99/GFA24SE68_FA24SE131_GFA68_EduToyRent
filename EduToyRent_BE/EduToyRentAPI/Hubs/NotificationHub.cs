using EduToyRentRepositories.Interface;
using EduToyRentRepositories.Models;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace EduToyRentAPI.Hubs

{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userIdClaim = Context.User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User-{userId}");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userIdClaim = Context.User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User-{userId}");
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
