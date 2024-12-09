using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Response
{
    public class WalletTransactionResponse
    {
        public int Id { get; set; }
        public string TransactionType { get; set; }
        public int Amount { get; set; }
        public DateTime? Date { get; set; }
        public int WalletId { get; set; }
        public int PaymentTypeId { get; set; }
        public int? OrderId { get; set; }
        public int SenderId { get; set; }
        public string Status { get; set; }
    }
}
