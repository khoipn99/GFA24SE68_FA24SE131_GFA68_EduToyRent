﻿using EduToyRentRepositories.Interface;
using EduToyRentRepositories.Models;
using Microsoft.AspNetCore.SignalR;
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
                var message = new Message
                {
                    Content = messageContent,
                    SentTime = DateTime.UtcNow,
                    SenderId = senderId,
                    ConversationId = conversationId,
                    IsRead = false
                };

                await _unitOfWork.MessageRepository.InsertAsync(message);
                await _unitOfWork.SaveAsync();

                var messageResponse = new
                {
                    message.Id,
                    message.Content,
                    message.SentTime,
                    message.SenderId,
                    message.ConversationId
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
