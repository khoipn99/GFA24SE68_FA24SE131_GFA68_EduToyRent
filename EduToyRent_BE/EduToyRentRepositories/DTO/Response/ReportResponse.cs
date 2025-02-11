﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Response
{
    public class ReportResponse
    {
        public int Id { get; set; }
        public string? VideoUrl { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public int OrderDetailId { get; set; }
        public OrderDetailResponse OrderDetail { get; set; }
        public int UserId { get; set; }
        public UserResponse User { get; set; } 

    }
}
