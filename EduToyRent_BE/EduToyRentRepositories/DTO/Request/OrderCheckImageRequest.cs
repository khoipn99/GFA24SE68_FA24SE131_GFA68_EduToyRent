﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Request
{
    public class OrderCheckImageRequest
    {
        public string MediaUrl { get; set; }
        public string Status { get; set; }
        public int OrderDetailId { get; set; }
    }
}
