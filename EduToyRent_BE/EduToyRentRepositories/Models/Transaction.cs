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
    public class Transaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public float? ReceiveMoney { get; set; } = default(float?);
        public float? PlatformFee { get; set; } = default(float?);
        public float? OwnerReceiveMoney { get; set; } = default(float?);
        public float? DepositBackMoney { get; set; } = default(float?);
        public float? FineFee { get; set; } = default(float?);
        public DateTime? Date {  get; set; } 
        public string Status { get; set; }
        public int OrderId { get; set; }
        [ForeignKey(nameof(OrderId))]
        public virtual Order Order { get; set; } = null!;
    }
}
