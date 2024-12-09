using Microsoft.EntityFrameworkCore;
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
    public class OrderDetail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int? RentPrice { get; set; } = 0;
        public int? Deposit { get; set; } = 0;
        public int UnitPrice { get; set; }
        public int Quantity { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; }
        public int OrderId { get; set; }
        [ForeignKey(nameof(OrderId))]
        public virtual Order Order { get; set; } = null!;
        public int ToyId { get; set; }
        [ForeignKey(nameof(ToyId))]
        public virtual Toy Toy { get; set; } = null!;
        public int OrderTypeId { get; set; }
        [ForeignKey(nameof(OrderTypeId))]
        public virtual OrderType OrderType { get; set; } = null!;
        public int? RatingId { get; set; }
        [ForeignKey(nameof(RatingId))]
        public virtual Rating Rating { get; set; } = null!;
    }
}
