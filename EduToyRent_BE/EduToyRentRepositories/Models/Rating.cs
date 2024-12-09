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
    public class Rating
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string? Comment { get; set; } = string.Empty;
        public float Star { get; set; }
        public DateTime RatingDate { get; set; }
        public int UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;
        public int OrderDetailId { get; set; }
        [ForeignKey(nameof(OrderDetailId))]
        public virtual OrderDetail OrderDetail { get; set; } = null!;

    }
}
