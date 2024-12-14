using EduToyRentRepositories.Interface;
using EduToyRentRepositories.Models;
using Microsoft.AspNetCore.SignalR;
using NuGet.Protocol.Plugins;
using System.Security.Claims;
namespace EduToyRentAPI.Hubs
{
    public class ChatHub:Hub
    {
        private readonly IUnitOfWork _unitOfWork;

        public ChatHub(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task SendMessage(int conversationId, string messageContent)
        {
            var senderIdClaim = Context.User.FindFirst(ClaimTypes.NameIdentifier);

            if (senderIdClaim == null || !int.TryParse(senderIdClaim.Value, out int senderId))
            {
                await Clients.Caller.SendAsync("Error", "Invalid user ID.");
                return;
            }

            if (string.IsNullOrWhiteSpace(messageContent))
            {
                await Clients.Caller.SendAsync("Error", "Message content cannot be empty.");
                return;
            }

            var isParticipant = _unitOfWork.UserConversationRepository.GetV2(
                uc => uc.UserId == senderId && uc.ConversationId == conversationId).Any();

            if (!isParticipant)
            {
                await Clients.Caller.SendAsync("Error", "You are not a participant in this conversation.");
                return;
            }

            try
            {
                var message = new EduToyRentRepositories.Models.Message
                {
                    Content = messageContent,
                    SentTime = DateTime.UtcNow,
                    SenderId = senderId,
                    ConversationId = conversationId,
                    IsRead = false
                };
                var conversation = _unitOfWork.ConversationRepository.GetByID(conversationId);
                conversation.LastMessage = message.Content;
                conversation.LastSentTime = message.SentTime;
                _unitOfWork.ConversationRepository.Update(conversation);
                await _unitOfWork.MessageRepository.InsertAsync(message);
                await _unitOfWork.SaveAsync();

                var messageResponse = new
                {
                    Id = message.Id,
                    IsRead = message.IsRead,
                    Content = message.Content,
                    SentTime = message.SentTime,
                    SenderId = message.SenderId,
                    SenderName = _unitOfWork.UserRepository.GetByID(message.SenderId).FullName,
                    ConversationId = message.ConversationId
                };

                await Clients.Group($"Conversation-{conversationId}").SendAsync("ReceiveMessage", messageResponse);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in SendMessage: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                await Clients.Caller.SendAsync("Error", "An error occurred while sending the message.");
            }
        }

        public override async Task OnConnectedAsync()
       {
            var userIdClaim = Context.User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                var conversations = _unitOfWork.UserConversationRepository.GetV2(
                    uc => uc.UserId == userId);

                foreach (var conversation in conversations)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"Conversation-{conversation.ConversationId}");
                }
            }

            await base.OnConnectedAsync();
       }
        public async Task JoinGroup(int conversationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Conversation-{conversationId}");
        }
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userIdClaim = Context.User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                var conversations = _unitOfWork.UserConversationRepository.GetV2(
                    uc => uc.UserId == userId);

                foreach (var conversation in conversations)
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Conversation-{conversation.ConversationId}");
                }
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
