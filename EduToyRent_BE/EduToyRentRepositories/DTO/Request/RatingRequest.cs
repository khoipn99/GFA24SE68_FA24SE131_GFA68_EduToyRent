using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Request
{
    public class RatingRequest
    {
        public string Comment { get; set; }
        public float Star { get; set; }
        public int UserId { get; set; }
        public int OrderDetailId { get; set; }
    }
}
