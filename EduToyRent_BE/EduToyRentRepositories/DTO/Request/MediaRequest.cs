using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Request
{
    public class MediaRequest
    {
        public IFormFile MediaUrl { get; set; }
        public string Status { get; set; }
        public int ToyId { get; set; }
    }
}
