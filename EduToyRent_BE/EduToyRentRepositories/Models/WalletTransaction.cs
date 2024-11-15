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
    public class WalletTransaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string TransactionType { get; set; }
        public int Amount { get; set; }
        public int WalletId { get; set; }
        [ForeignKey(nameof(WalletId))]
        public virtual Wallet Wallet { get; set; } = null!;
        public int PaymentTypeId { get; set; }
        [ForeignKey(nameof(PaymentTypeId))]
        public virtual PaymentType PaymentType { get; set; } = null!;
        public int? OrderId { get; set; }
        [ForeignKey(nameof(OrderId))]
        public virtual Order Order { get; set; } = null!;
        public int SenderId { get; set; }
        [ForeignKey(nameof(SenderId))]
        public virtual User User { get; set; } = null!;
    }
}
