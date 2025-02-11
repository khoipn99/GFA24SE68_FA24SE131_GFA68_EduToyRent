﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Request
{
    public class OrderRequest
    {
        public DateTime OrderDate { get; set; }
        public DateTime? ReceiveDate { get; set; }
        public int TotalPrice { get; set; }
        public int RentPrice { get; set; }
        public int DepositeBackMoney { get; set; }
        public float? Fine { get; set; }
        public string ReceiveName { get; set; }
        public string ReceiveAddress { get; set; }
        public string ReceivePhone { get; set; }
        public string Status { get; set; }
        public int UserId { get; set; }
        
    }
}
