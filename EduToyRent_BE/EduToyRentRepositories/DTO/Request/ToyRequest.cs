using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Request
{
    public class ToyRequest
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public int Price { get; set; }
        public int? BuyQuantity { get; set; }
        [Required]
        public string Origin { get; set; }

        [Required]
        public string Age { get; set; }

        [Required]
        public string Brand { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public int RentCount { get; set; }
        public string RentTime { get; set; }
        public string Status { get; set; }
    }

}
