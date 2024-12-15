using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.Models
{
    [PrimaryKey("Id")]
    public class Conversation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string? LastMessage { get; set; } = string.Empty;
        public DateTime? LastSentTime { get; set; }
        public string Status { get; set; }
        public virtual ICollection<UserConversation> UserConversations { get; set; } = new List<UserConversation>();

    }
}
