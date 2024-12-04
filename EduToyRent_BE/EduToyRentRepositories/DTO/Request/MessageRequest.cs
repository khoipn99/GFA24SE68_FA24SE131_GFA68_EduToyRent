using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Request
{
    public class MessageRequest
    {
        public bool IsRead { get; set; }
        public string Content { get; set; }
        public string? MediaUrl { get; set; }
        public int SenderId { get; set; }
        public int ConversationId { get; set; }
        public DateTime SentTime { get; set; }
    }
}
