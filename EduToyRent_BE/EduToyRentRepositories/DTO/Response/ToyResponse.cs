using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Response
{
    public class ToyResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int Price { get; set; }
        public string Origin { get; set; }
        public string Age { get; set; }
        public string Brand { get; set; }
        public int RentCount { get; set; }
        public int BuyQuantity { get; set; }
        public DateTime CreateDate { get; set; }
        public string RentTime { get; set; }
        public string Status { get; set; }
        public UserResponse Owner { get; set; }
        public UserResponse Approver { get; set; }
        public CategoryResponse Category { get; set; }
    }
}
