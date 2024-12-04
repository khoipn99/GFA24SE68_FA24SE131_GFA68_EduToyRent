using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Response
{
    public class MessageResponse
    {
        public int Id { get; set; }
        public bool IsRead { get; set; }
        public string Content { get; set; }
        public string? MediaUrl { get; set; }
        public DateTime SentTime { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; }
        public int ConversationId { get; set; }
    }
}
