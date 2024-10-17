using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace EduToyRentRepositories.Models
{
    [PrimaryKey("Id")]
    public class RatingImage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string MediaUrl { get; set; }
        public string Status { get; set; }
        public int RatingId { get; set; }
        [ForeignKey(nameof(RatingId))]
        public virtual Rating Rating { get; set; } = null!;
    }
}
