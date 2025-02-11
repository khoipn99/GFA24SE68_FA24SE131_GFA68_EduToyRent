﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Request
{
    public class TransactionDetailRequest
    {        
        [Required]
        public float ReceiveMoney { get; set; }
        [Required]
        public float PlatformFee { get; set; }
        [Required]
        public float OwnerReceiveMoney { get; set; }
        [Required]
        public float DepositBackMoney { get; set; }
        [Required]
        public string Status { get; set; }
        [Required]
        public int OrderDetailId { get; set; }
        [Required]
        public int TransactionId { get; set; }
        public int PlatformFeeId { get; set; }
        public float? FineFee { get; set; }
        public DateTime Date { get; set; }
    }
}
