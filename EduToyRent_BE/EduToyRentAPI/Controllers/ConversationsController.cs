using EduToyRentRepositories.DTO.Request;
using EduToyRentRepositories.DTO.Response;
using EduToyRentRepositories.Interface;
using EduToyRentRepositories.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ConversationsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public ConversationsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/v1/Conversations/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMyConversations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            var userConversations = await _unitOfWork.UserConversationRepository.GetAsync(
                uc => uc.UserId == userId,
                includeProperties: "Conversation");

            var conversationDtos = userConversations.Select(uc => new ConversationResponse
            {
                Id = uc.Conversation.Id,
                LastMessage = uc.Conversation.LastMessage,
                LastSentTime = (DateTime)uc.Conversation.LastSentTime,
                Status = uc.Conversation.Status
            }).ToList();

            return Ok(conversationDtos);
        }

        // GET: api/v1/Conversations/{conversationId}
        [HttpGet("{conversationId}")]
        public async Task<IActionResult> GetConversationById(int conversationId)
        {
            var conversation = _unitOfWork.ConversationRepository.GetByID(conversationId);

            if (conversation == null)
            {
                return NotFound();
            }

            var conversationDto = new ConversationResponse
            {
                Id = conversation.Id,
                LastMessage = conversation.LastMessage,
                LastSentTime = (DateTime)conversation.LastSentTime,
                Status = conversation.Status
            };

            return Ok(conversationDto);
        }

        // POST: api/v1/Conversations
        [HttpPost]
        public async Task<IActionResult> CreateConversation(ConversationRequest request)
        {
            var conversation = new Conversation
            {
                LastMessage = request.LastMessage,
                LastSentTime = DateTime.UtcNow,
                Status = request.Status
            };

            _unitOfWork.ConversationRepository.Insert(conversation);
            await _unitOfWork.SaveAsync();

            return CreatedAtAction(nameof(GetConversationById), new { conversationId = conversation.Id }, conversation);
        }

        // PUT: api/v1/Conversations/{conversationId}
        [HttpPut("{conversationId}")]
        public async Task<IActionResult> UpdateConversation(int conversationId, ConversationRequest request)
        {
            var conversation = _unitOfWork.ConversationRepository.GetByID(conversationId);

            if (conversation == null)
            {
                return NotFound();
            }

            conversation.LastMessage = request.LastMessage;
            conversation.LastSentTime = DateTime.UtcNow;
            conversation.Status = request.Status;

            _unitOfWork.ConversationRepository.Update(conversation);
            await _unitOfWork.SaveAsync();

            return NoContent();
        }

        [HttpPost("{conversationId}/add-participants")]
        public async Task<IActionResult> AddParticipants(int conversationId, [FromBody] List<int> participantIds)
        {
            var conversation = _unitOfWork.ConversationRepository.GetByID(conversationId);

            if (conversation == null)
            {
                return NotFound();
            }

            foreach (var participantId in participantIds)
            {
                var userConversation = new UserConversation
                {
                    UserId = participantId,
                    ConversationId = conversationId
                };

                _unitOfWork.UserConversationRepository.Insert(userConversation);
            }
            await _unitOfWork.SaveAsync();

            return Ok();
        }
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetConversationsByUserId(int userId)
        {
            var userConversations = await _unitOfWork.UserConversationRepository.GetAsync(
                uc => uc.UserId == userId,
                includeProperties: "Conversation");

            if (userConversations == null || !userConversations.Any())
            {
                return NotFound("No conversations found for the user.");
            }

            var conversationDtos = userConversations.Select(uc => new ConversationResponse
            {
                Id = uc.Conversation.Id,
                LastMessage = uc.Conversation.LastMessage,
                LastSentTime = (DateTime)uc.Conversation.LastSentTime,
                Status = uc.Conversation.Status
            }).ToList();

            return Ok(conversationDtos);
        }
    }
}
