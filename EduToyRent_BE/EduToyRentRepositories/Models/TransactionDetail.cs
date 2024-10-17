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
    public class TransactionDetail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public float ReceiveMoney { get; set; }
        public float PlatformFee { get; set; }
        public float OwnerReceiveMoney { get; set; }
        public float DepositBackMoney { get; set; }
        public string Status { get; set; }
        public int OrderDetailId { get; set; }
        [ForeignKey(nameof(OrderDetailId))]
        public virtual OrderDetail OrderDetail { get; set; } = null!;
        public int TranSactionId { get; set; }
        [ForeignKey(nameof(TranSactionId))]
        public virtual Transaction Transaction { get; set; } = null!;
    }
}
