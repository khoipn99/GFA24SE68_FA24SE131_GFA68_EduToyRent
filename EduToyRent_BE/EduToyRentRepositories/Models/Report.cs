using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.Models
{
    [PrimaryKey("Id")]
    public class Report
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string? VideoUrl { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public int OrderDetailId { get; set; }
        [ForeignKey(nameof(OrderDetailId))]
        public virtual OrderDetail OrderDetail { get; set; } = null!;
        public int UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;
    }
}
