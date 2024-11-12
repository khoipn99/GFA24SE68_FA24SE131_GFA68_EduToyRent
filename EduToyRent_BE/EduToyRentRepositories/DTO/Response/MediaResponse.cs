using EduToyRentRepositories.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Response
{
    public class MediaResponse
    {
        public int Id { get; set; }
        public string MediaUrl { get; set; }
        public string Status { get; set; }
        public int ToyId { get; set; }
    }
}
