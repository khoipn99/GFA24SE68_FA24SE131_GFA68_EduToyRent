using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Request
{
    public class ReportRequest
    {
        public string? VideoUrl { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public int OrderDetailId { get; set; }
        public int UserId { get; set; }
    }
}
