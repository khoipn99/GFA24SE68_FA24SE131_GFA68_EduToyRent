using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Request
{
    public class CartRequest
    {
        public int TotalPrice { get; set; }
        public string Status { get; set; } = string.Empty;
        public int UserId { get; set; }
    }
}
