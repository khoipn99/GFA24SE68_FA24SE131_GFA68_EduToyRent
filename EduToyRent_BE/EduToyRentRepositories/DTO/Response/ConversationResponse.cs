using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Response
{
    public class ConversationResponse
    {
        public int Id { get; set; }
        public string LastMessage { get; set; }
        public DateTime LastSentTime { get; set; }
        public string Status { get; set; }
        public int? UnreadCount { get; set; }
        public List<ParticipantResponse> ParticipantResponse { get; set; } = new List<ParticipantResponse>();
    }
}
