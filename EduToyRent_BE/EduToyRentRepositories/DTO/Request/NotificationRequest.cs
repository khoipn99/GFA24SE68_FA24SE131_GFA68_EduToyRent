using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Request
{
    public class NotificationRequest
    {
        public string Notify { get; set; } = string.Empty;
        public bool? IsRead { get; set; } = false; 
        public int UserId { get; set; }
    }
}
