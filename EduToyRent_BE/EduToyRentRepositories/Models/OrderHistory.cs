using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.Models
{
    [PrimaryKey("Id")]
    public class OrderHistory
    {
        public int Id { get; set; }
        public string Reason { get; set; }
        public DateTime UpdateDate { get; set; }
        public string Status { get; set; }
        public int OrderDetailId { get; set; }
        [ForeignKey(nameof(OrderDetailId))]
        public virtual OrderDetail OrderDetail { get; set; } = null!;
        public int UserUpdateId { get; set; }
        [ForeignKey(nameof(UserUpdateId))]
        public virtual User? User { get; set; } = null!;
    }
}
