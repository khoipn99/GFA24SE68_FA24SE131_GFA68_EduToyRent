using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Request
{
    public class OrderHistoryRequest
    {
        public string Reason { get; set; }
        public string Status { get; set; }
        public int OrderDetailId { get; set; }
        public int UserUpdateId { get; set; }
    }

}
