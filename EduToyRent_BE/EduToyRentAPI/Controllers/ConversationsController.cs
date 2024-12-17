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
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var vietnamTime = TimeZoneInfo.ConvertTime(DateTime.Now, vietnamTimeZone);

            var conversation = new Conversation
            {
                LastMessage = request.LastMessage,
                LastSentTime = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")),
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
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var vietnamTime = TimeZoneInfo.ConvertTime(DateTime.Now, vietnamTimeZone);

            var conversation = _unitOfWork.ConversationRepository.GetByID(conversationId);

            if (conversation == null)
            {
                return NotFound();
            }

            conversation.LastMessage = request.LastMessage;
            conversation.LastSentTime = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"));
            conversation.Status = request.Status;

            _unitOfWork.ConversationRepository.Update(conversation);
            await _unitOfWork.SaveAsync();

            return NoContent();
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetConversationsByUserId(int userId)
        {
            var userConversations = await _unitOfWork.UserConversationRepository.GetAsync(
                uc => uc.UserId == userId,
                includeProperties: "Conversation,Conversation.UserConversations.User"
            );

            if (userConversations == null || !userConversations.Any())
            {
                return NotFound("No conversations found for the user.");
            }

            var conversationDtos = userConversations.Select(uc => new ConversationResponse
            {
                Id = uc.Conversation.Id,
                LastMessage = uc.Conversation.LastMessage,
                LastSentTime = (DateTime)uc.Conversation.LastSentTime,
                Status = uc.Conversation.Status,
                ParticipantResponse = uc.Conversation.UserConversations
                    .Where(x => x.UserId != userId)
                    .Select(x => new ParticipantResponse
                    {
                        UserId = x.UserId,
                        Name = x.User.FullName,
                        AvatarUrl = x.User.AvatarUrl
                    }).ToList(),
                    UnreadCount = _unitOfWork.MessageRepository
                    .GetV2(m => m.ConversationId == uc.Conversation.Id && !m.IsRead && m.SenderId != userId)
                    .Count()
            }).ToList();
            return Ok(conversationDtos);
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

            return Ok("Participants added successfully");
        }

        //check and create
        [HttpPost("check-or-create-conversation")]
        public async Task<IActionResult> CheckOrCreateConversation([FromBody] CreateConversationRequest request)
        {
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var vietnamTime = TimeZoneInfo.ConvertTime(DateTime.Now, vietnamTimeZone);

            int user1Id = request.User1Id;
            int user2Id = request.User2Id;

            var user1ConvIds = _unitOfWork.UserConversationRepository
                .GetV2(uc => uc.UserId == user1Id)
                .Select(uc => uc.ConversationId)
                .ToList();

            if (user1ConvIds.Any())
            {
                var existingConversation = _unitOfWork.UserConversationRepository
                    .GetV2(uc => user1ConvIds.Contains(uc.ConversationId) && uc.UserId == user2Id)
                    .Select(uc => uc.Conversation)
                    .FirstOrDefault();

                if (existingConversation != null)
                {
                    var participantsCount = _unitOfWork.UserConversationRepository
                        .GetV2(uc => uc.ConversationId == existingConversation.Id)
                        .Count();

                    if (participantsCount == 2) 
                    {
                        return Ok(new { ConversationId = existingConversation.Id, Message = "Conversation already exists" });
                    }
                }
            }

            var newConversation = new Conversation
            {
                LastMessage = null,
                LastSentTime = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")),
                Status = "Active"
            };

            _unitOfWork.ConversationRepository.Insert(newConversation);
            await _unitOfWork.SaveAsync();

            var userConv1 = new UserConversation { UserId = user1Id, ConversationId = newConversation.Id };
            var userConv2 = new UserConversation { UserId = user2Id, ConversationId = newConversation.Id };

            _unitOfWork.UserConversationRepository.Insert(userConv1);
            _unitOfWork.UserConversationRepository.Insert(userConv2);
            await _unitOfWork.SaveAsync();

            return Ok(new { ConversationId = newConversation.Id, Message = "New conversation created" });
        }

        [HttpPost("create-group-conversation")]
        public async Task<IActionResult> CreateGroupConversation([FromBody] CreateGroupConversationRequest request)
        {
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var vietnamTime = TimeZoneInfo.ConvertTime(DateTime.Now, vietnamTimeZone);

            if (request.UserIds == null || !request.UserIds.Any())
            {
                return BadRequest(new { Message = "UserIds list cannot be empty." });
            }

            try
            {
                var newConversation = new Conversation
                {
                    LastMessage = null,
                    LastSentTime = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")),
                    Status = "Active"
                };

                _unitOfWork.ConversationRepository.Insert(newConversation);
                await _unitOfWork.SaveAsync();

                foreach (var userId in request.UserIds)
                {
                    var userConversation = new UserConversation
                    {
                        UserId = userId,
                        ConversationId = newConversation.Id
                    };
                    _unitOfWork.UserConversationRepository.Insert(userConversation);
                }

                await _unitOfWork.SaveAsync();

                return Ok(new { ConversationId = newConversation.Id, Message = "Group conversation created successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateGroupConversation: {ex.Message}");
                return StatusCode(500, new { Error = "An error occurred while creating the group conversation." });
            }
        }
        public class CreateGroupConversationRequest
        {
            public List<int> UserIds { get; set; }
        }
        public class CreateConversationRequest
        {
            public int User1Id { get; set; }
            public int User2Id { get; set; }
        }
    }
}
