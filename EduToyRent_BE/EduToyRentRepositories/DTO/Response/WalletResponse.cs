using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Response
{
    public class WalletResponse
    {
        public int Id { get; set; }
        public float Balance { get; set; }
        public string WithdrawMethod { get; set; }
        public string WithdrawInfo { get; set; }
        public string Status { get; set; }
        public int UserId { get; set; }
    }
}
