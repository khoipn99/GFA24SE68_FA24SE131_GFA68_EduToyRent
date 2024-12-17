using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduToyRentRepositories.Models;
using EduToyRentRepositories.DTO.Request;
using EduToyRentRepositories.DTO.Response;
using EduToyRentRepositories.Interface;
using System.Security.Claims;

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public MessagesController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/Messages
        [HttpGet]
        public ActionResult<IEnumerable<MessageResponse>> GetMessages(int pageIndex = 1, int pageSize = 50)
        {
            var messages = _unitOfWork.MessageRepository.Get(
                includeProperties: "User,Conversation",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Select(message => new MessageResponse
                {
                    Id = message.Id,
                    IsRead = message.IsRead,
                    Content = message.Content,
                    MediaUrl = message.MediaUrl,
                    SentTime = message.SentTime,
                    SenderId = message.SenderId,
                    SenderName = message.User.FullName,
                    ConversationId = message.ConversationId
                }).ToList();

            return Ok(messages);
        }

        // GET: api/Messages/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MessageResponse>> GetMessage(int id)
        {
            var message = _unitOfWork.MessageRepository.GetByID(id);

            if (message == null)
            {
                return NotFound();
            }

            var messageResponse = new MessageResponse
            {
                Id = message.Id,
                IsRead = message.IsRead,
                Content = message.Content,
                MediaUrl = message.MediaUrl,
                SentTime = message.SentTime,
                SenderId = message.SenderId,
                SenderName = message.User.FullName,
                ConversationId = message.ConversationId
            };

            return Ok(messageResponse);
        }

        // PUT: api/Messages/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMessage(int id, MessageRequest messageRequest)
        {
            var message = _unitOfWork.MessageRepository.GetByID(id);

            if (message == null)
            {
                return NotFound();
            }

            message.IsRead = messageRequest.IsRead;
            message.Content = messageRequest.Content;
            message.MediaUrl = messageRequest.MediaUrl;
            message.SentTime = messageRequest.SentTime;
            message.SenderId = messageRequest.SenderId;
            message.ConversationId = messageRequest.ConversationId;

            _unitOfWork.MessageRepository.Update(message);

            try
            {
                _unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MessageExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Messages
        [HttpPost]
        public async Task<ActionResult<MessageResponse>> PostMessage(MessageRequest messageRequest)
        {
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var vietnamTime = TimeZoneInfo.ConvertTime(DateTime.Now, vietnamTimeZone);

            var message = new Message
            {
                IsRead = messageRequest.IsRead,
                Content = messageRequest.Content,
                MediaUrl = messageRequest.MediaUrl,
                SentTime = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")),
                SenderId = messageRequest.SenderId,
                ConversationId = messageRequest.ConversationId
            };

            _unitOfWork.MessageRepository.Insert(message);
            _unitOfWork.Save();

            var messageResponse = new MessageResponse
            {
                Id = message.Id,
                IsRead = message.IsRead,
                Content = message.Content,
                MediaUrl = message.MediaUrl,
                SentTime = message.SentTime,
                SenderId = message.SenderId,
                SenderName = _unitOfWork.UserRepository.GetByID(message.SenderId)?.FullName,
                ConversationId = message.ConversationId
            };

            return CreatedAtAction("GetMessage", new { id = message.Id }, messageResponse);
        }

        // DELETE: api/Messages/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var message = _unitOfWork.MessageRepository.GetByID(id);
            if (message == null)
            {
                return NotFound();
            }

            _unitOfWork.MessageRepository.Delete(message);
            _unitOfWork.Save();

            return NoContent();
        }

        [HttpGet("conversation/{conversationId}")]
        public async Task<IActionResult> GetMessagesByConversation(int conversationId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            var isParticipant = _unitOfWork.UserConversationRepository.GetV2(
                uc => uc.UserId == userId && uc.ConversationId == conversationId).Any();

            if (!isParticipant)
            {
                return Forbid();
            }

            var messages = _unitOfWork.MessageRepository.Get(
                m => m.ConversationId == conversationId,
                includeProperties: "User")
                .Select(message => new MessageResponse
                {
                    Id = message.Id,
                    IsRead = message.IsRead,
                    Content = message.Content,
                    MediaUrl = message.MediaUrl,
                    SentTime = message.SentTime,
                    SenderId = message.SenderId,
                    SenderName = message.User.FullName,
                    ConversationId = message.ConversationId
                }).OrderBy(m => m.SentTime).ToList();

            return Ok(messages);
        }

        [HttpPut("markread/{conversationId}")]
        public async Task<IActionResult> MarkAllMessagesAsRead(int conversationId)
        {
            var mess = _unitOfWork.MessageRepository.GetV2(m => m.ConversationId == conversationId && !m.IsRead);

            if (mess == null || !mess.Any())
            {
                return Ok("All messages already read or no messages found");
            }

            foreach (var msg in mess)
            {
                msg.IsRead = true;
                _unitOfWork.MessageRepository.Update(msg);
            }

            await _unitOfWork.SaveAsync();
            return Ok("All messages marked as read");
        }

        private bool MessageExists(int id)
        {
            return _unitOfWork.MessageRepository.Get().Any(m => m.Id == id);
        }
    }
}
