using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Request
{
    public class WalletTransactionRequest
    {
        public string TransactionType { get; set; }
        public int Amount { get; set; }
        public DateTime? Date { get; set; }
        public int WalletId { get; set; }
        public int PaymentTypeId { get; set; }
        public int? OrderId { get; set; }
        public string Status {  get; set; }
    }
}
