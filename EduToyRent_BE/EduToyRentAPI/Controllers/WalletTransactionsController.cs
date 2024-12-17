using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduToyRentRepositories.Models;
using EduToyRentRepositories.DTO.Request;
using EduToyRentRepositories.DTO.Response;
using EduToyRentRepositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OData.Query;
using System.Security.Claims;

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class WalletTransactionController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public WalletTransactionController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/WalletTransaction
        [HttpGet]
        [EnableQuery]
        public ActionResult<IEnumerable<WalletTransactionResponse>> GetWalletTransactions(int pageIndex = 1, int pageSize = 50)
        {
            var walletTransactions = _unitOfWork.WalletTransactionRepository.Get(
                includeProperties: "Wallet,PaymentType",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Select(tx => new WalletTransactionResponse
                {
                    Id = tx.Id,
                    TransactionType = tx.TransactionType,
                    Amount = tx.Amount,
                    Date = tx.Date,
                    WalletId = tx.WalletId,
                    PaymentTypeId = tx.PaymentTypeId,
                    OrderId = tx.OrderId,
                    SenderId = tx.SenderId,
                    Status = tx.Status,
                }).ToList();

            return Ok(walletTransactions);
        }

        // GET: api/WalletTransaction/5
        [HttpGet("{id}")]
        [EnableQuery]
        public async Task<ActionResult<WalletTransactionResponse>> GetWalletTransaction(int id)
        {
            var walletTransaction = _unitOfWork.WalletTransactionRepository.GetByID(id);

            if (walletTransaction == null)
            {
                return NotFound();
            }

            var walletTransactionResponse = new WalletTransactionResponse
            {
                Id = walletTransaction.Id,
                TransactionType = walletTransaction.TransactionType,
                Amount = walletTransaction.Amount,
                Date = walletTransaction.Date,
                WalletId = walletTransaction.WalletId,
                PaymentTypeId = walletTransaction.PaymentTypeId,
                OrderId = walletTransaction.OrderId,
                SenderId = walletTransaction.SenderId,
                Status = walletTransaction.Status,
            };

            return Ok(walletTransactionResponse);
        }

        // PUT: api/WalletTransaction/5
        [HttpPut("{id}")]
        [EnableQuery]
        public async Task<IActionResult> PutWalletTransaction(int id, WalletTransactionRequest walletTransactionRequest)
        {
            var walletTransaction = _unitOfWork.WalletTransactionRepository.GetByID(id);

            if (walletTransaction == null)
            {
                return NotFound();
            }

            walletTransaction.TransactionType = walletTransactionRequest.TransactionType;
            walletTransaction.Amount = walletTransactionRequest.Amount;
            walletTransaction.Date = walletTransactionRequest.Date;
            walletTransaction.PaymentTypeId = walletTransactionRequest.PaymentTypeId;
            walletTransaction.OrderId = walletTransactionRequest.OrderId;
            walletTransaction.Status = walletTransactionRequest.Status;

            _unitOfWork.WalletTransactionRepository.Update(walletTransaction);

            try
            {
                _unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WalletTransactionExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/WalletTransaction
        [HttpPost]
        [EnableQuery]
        public async Task<ActionResult<WalletTransactionResponse>> PostWalletTransaction(WalletTransactionRequest walletTransactionRequest)
        {
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var vietnamTime = TimeZoneInfo.ConvertTime(DateTime.Now, vietnamTimeZone);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int senderId))
            {
                return Unauthorized(new { Message = "Invalid or missing user ID from token." });
            }

            var walletTransaction = new WalletTransaction
            {
                TransactionType = walletTransactionRequest.TransactionType,
                Amount = walletTransactionRequest.Amount,
                Date = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")),
                WalletId = walletTransactionRequest.WalletId,
                PaymentTypeId = walletTransactionRequest.PaymentTypeId,
                OrderId = walletTransactionRequest.OrderId,
                SenderId = senderId,
                Status = walletTransactionRequest.Status,
            };

            _unitOfWork.WalletTransactionRepository.Insert(walletTransaction);
            _unitOfWork.Save();

            var walletTransactionResponse = new WalletTransactionResponse
            {
                Id = walletTransaction.Id,
                TransactionType = walletTransaction.TransactionType,
                Date = walletTransaction.Date,
                Amount = walletTransaction.Amount,
                WalletId = walletTransaction.WalletId,
                PaymentTypeId = walletTransaction.PaymentTypeId,
                OrderId = walletTransaction.OrderId,
                SenderId = walletTransaction.SenderId,
                Status = walletTransaction.Status,
            };

            return CreatedAtAction("GetWalletTransaction", new { id = walletTransaction.Id }, walletTransactionResponse);
        }


        // DELETE: api/WalletTransaction/5
        [HttpDelete("{id}")]
        [EnableQuery]
        public async Task<IActionResult> DeleteWalletTransaction(int id)
        {
            var walletTransaction = _unitOfWork.WalletTransactionRepository.GetByID(id);
            if (walletTransaction == null)
            {
                return NotFound();
            }

            _unitOfWork.WalletTransactionRepository.Delete(walletTransaction);
            _unitOfWork.Save();

            return NoContent();
        }

        // GET: api/WalletTransaction/ByWalletId
        [HttpGet("ByWalletId")]
        [EnableQuery]
        public ActionResult<IEnumerable<WalletTransactionResponse>> GetWalletTransactionsByWalletId(int walletId, int pageIndex = 1, int pageSize = 50)
        {
            var walletTransactions = _unitOfWork.WalletTransactionRepository.Get(
                includeProperties: "Wallet,PaymentType",
                filter: w => w.WalletId == walletId,
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(t => t.Id)                
                .Select(tx => new WalletTransactionResponse
                {
                    Id = tx.Id,
                    TransactionType = tx.TransactionType,
                    Amount = tx.Amount,
                    Date = tx.Date,
                    WalletId = tx.WalletId,
                    PaymentTypeId = tx.PaymentTypeId,
                    OrderId = tx.OrderId,
                    SenderId = tx.SenderId,
                    Status = tx.Status,
                }).ToList();

            return Ok(walletTransactions);
        }

        private bool WalletTransactionExists(int id)
        {
            return _unitOfWork.WalletTransactionRepository.Get().Any(e => e.Id == id);
        }
    }
}
