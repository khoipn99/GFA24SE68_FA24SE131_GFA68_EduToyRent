using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Response
{
    public class RatingImageResponse
    {
        public int Id { get; set; }
        public string MediaUrl { get; set; }
        public string Status { get; set; }
        public int RatingId { get; set; }
    }
}
