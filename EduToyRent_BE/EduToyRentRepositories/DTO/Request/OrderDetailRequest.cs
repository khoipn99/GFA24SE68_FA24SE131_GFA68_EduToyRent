using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Request
{
    public class OrderDetailRequest
    {
        public int RentPrice { get; set; }
        public int Deposit { get; set; }
        public int UnitPrice { get; set; }
        public int Quantity { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public float? Fine { get; set; }
        public int? RentCount { get; set; }
        public string Status { get; set; }
        public int OrderId { get; set; }
        public int ToyId { get; set; }
        public int OrderTypeId { get; set; }
        public int? RatingId { get; set; }
    }
}
