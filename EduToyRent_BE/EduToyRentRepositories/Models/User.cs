﻿using Microsoft.EntityFrameworkCore;
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
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public DateTime CreateDate { get; set; }
        public string Phone { get; set; }
        public DateTime? Dob { get; set; }
        public string? Address { get; set; }
        public string? AvatarUrl { get; set; }
        public float? Star {  get; set; }
        public string? Description { get; set; }
        public string Status { get; set; }
        public int? PremiumId { get; set; }
        [ForeignKey(nameof(PremiumId))]
        public virtual Premium Premium { get; set; } = null!;
        public DateTime? StartPremiumDate { get; set; }
        public DateTime? EndPremiumDate { get; set; }
        public int RoleId { get; set; }
        [ForeignKey(nameof(RoleId))]
        public virtual Role Role { get; set; } = null!;
        public int? WalletId { get; set; }
        [ForeignKey(nameof(WalletId))]
        public virtual Wallet Wallet { get; set; } = null!;
    }
}
