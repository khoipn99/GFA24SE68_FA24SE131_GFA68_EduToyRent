using EduToyRentRepositories.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Response
{
    public class TransactionDetailResponse
    {
        public int Id { get; set; }
        public float ReceiveMoney { get; set; }
        public float PlatformFee { get; set; }
        public float OwnerReceiveMoney { get; set; }
        public float DepositBackMoney { get; set; }
        public string Status { get; set; }
        public OrderDetailResponse OrderDetail { get; set; }
        public TransactionResponse Transaction { get; set; }
    }
}
