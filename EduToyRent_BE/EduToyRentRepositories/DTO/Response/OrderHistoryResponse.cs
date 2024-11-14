using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Response
{
    public class OrderHistoryResponse
    {
        public int Id { get; set; }
        public string Reason { get; set; }
        public DateTime UpdateDate { get; set; }
        public string Status { get; set; }
        public int OrderDetailId { get; set; }  
        public int UserUpdateId { get; set; }
    }

}
