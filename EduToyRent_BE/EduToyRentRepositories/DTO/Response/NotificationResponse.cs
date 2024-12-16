﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Response
{
    public class NotificationResponse
    {
        public int Id { get; set; } 
        public string Notify { get; set; } = string.Empty; 
        public DateTime SentTime { get; set; } 
        public bool IsRead { get; set; } = false; 
        public int UserId { get; set; } 
    }
}
