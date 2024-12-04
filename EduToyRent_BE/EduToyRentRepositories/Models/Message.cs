using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.Models
{
    [PrimaryKey("Id")]
    public class Message
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public bool IsRead { get; set; }
        public string Content { get; set; }
        public string? MediaUrl { get; set; } = "abc";
        public DateTime SentTime { get; set; }
        public int SenderId { get; set; }
        [ForeignKey(nameof(SenderId))]
        public virtual User User { get; set; } = null!;
        public int ConversationId { get; set; }
        [ForeignKey(nameof(ConversationId))]
        public virtual Conversation Conversation { get; set; } = null!;
    }
}
