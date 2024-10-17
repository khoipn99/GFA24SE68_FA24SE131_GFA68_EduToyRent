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
    public class ToySupplier
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string ToySupplierName { get; set; }
        public float Star { get; set; }
        public bool IsPremium { get; set; }
        public DateTime StartPremiumDate { get; set; }
        public DateTime EndPremiumDate { get;  set; }
        public string Status { get; set; }
        public int UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;
        public int PremiumId { get; set; }
        [ForeignKey(nameof(PremiumId))]
        public virtual Premium Premium { get; set; } = null!;
    }
}
