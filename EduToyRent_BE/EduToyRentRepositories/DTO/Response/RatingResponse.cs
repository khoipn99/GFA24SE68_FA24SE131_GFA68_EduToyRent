using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Response
{
    public class RatingResponse
    {
        public int Id { get; set; }
        public string Comment { get; set; }
        public float Star { get; set; }
        public int UserId { get; set; }
        public DateTime RatingDate { get; set; }
        public string UserName { get; set; } 
        public string AvartarUrl { get; set; }
        public int OrderDetailId { get; set; }
    }
}
