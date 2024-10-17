using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.Models
{
    [PrimaryKey("Id")]
    public class Toy
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
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
        public int UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;
        public int CategoryId { get; set; }
        [ForeignKey(nameof(CategoryId))]
        public virtual Category Category { get; set; } = null!;
        public int? ApproverId { get; set; } 
        [ForeignKey(nameof(ApproverId))]
        public virtual User Approver { get; set; } = null!;
    }
}
