using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Request
{
    public class CartItemRequest
    {
        public int Price { get; set; }
        public int Quantity { get; set; }
        public string Status { get; set; } = string.Empty;
        public int CartId { get; set; }
        public int ToyId { get; set; }
        public int OrderTypeId { get; set; }
    }
}
