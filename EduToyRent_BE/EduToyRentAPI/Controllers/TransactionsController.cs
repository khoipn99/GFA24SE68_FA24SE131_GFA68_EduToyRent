using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduToyRentRepositories.Models;
using EduToyRentRepositories.Interface;
using EduToyRentRepositories.DTO.Response;
using Microsoft.IdentityModel.Tokens;
using Humanizer;
using EduToyRentRepositories.DTO.Request;

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public TransactionsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/Transactions
        [HttpGet]
        public ActionResult<IEnumerable<TransactionResponse>> GetTransactions(int pageIndex = 1, int pageSize = 50)
        {
           var transactions = _unitOfWork.TransactionRepository.Get(pageIndex: pageIndex, pageSize: pageSize)
                .Select(transaction => new TransactionResponse
                {
                    Id = transaction.Id,
                    ReceiveMoney = transaction.ReceiveMoney,
                    PlatformFee = transaction.PlatformFee,
                    OwnerReceiveMoney = transaction.OwnerReceiveMoney,
                    DepositBackMoney = transaction.DepositBackMoney,
                    OrderId = transaction.OrderId,
                }).ToList();
            if(!transactions.Any())
            {
                return Ok(("Empty List"));
            }
            return Ok(transactions);
        }

        // GET: api/Transactions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionResponse>> GetTransaction(int id)
        {
            var transaction = _unitOfWork.TransactionRepository.GetByID(id);

            if (transaction == null)
            {
                return NotFound();
            }
            var transactionRespone = new TransactionResponse
            {
                Id = transaction.Id,
                ReceiveMoney = transaction.ReceiveMoney,
                PlatformFee = transaction.PlatformFee,
                OwnerReceiveMoney = transaction.OwnerReceiveMoney,
                DepositBackMoney = transaction.DepositBackMoney,
                OrderId = transaction.OrderId,
            };
            return transactionRespone;
        }

        // PUT: api/Transactions/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTransaction(int id, TransactionRequest transaction)
        {
            var trans = _unitOfWork.TransactionRepository.GetByID(id);
            if (trans == null)
            {
                return NotFound(id);
            }

            trans.ReceiveMoney = transaction.ReceiveMoney;
            trans.PlatformFee = transaction.PlatformFee;
            trans.OwnerReceiveMoney = transaction.OwnerReceiveMoney;
            trans.DepositBackMoney = transaction.DepositBackMoney;
            trans.OrderId = transaction.OrderId;

            _unitOfWork.TransactionRepository.Update(trans);
            _unitOfWork.Save();

            return Ok("Update Successfully!!!");
        }

        // POST: api/Transactions
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Transaction>> PostTransaction(TransactionRequest transaction)
        {
            var trans = new Transaction
            {
                ReceiveMoney = transaction.ReceiveMoney,
                PlatformFee = transaction.PlatformFee,
                DepositBackMoney = transaction.DepositBackMoney,
                OwnerReceiveMoney = transaction.OwnerReceiveMoney,
                OrderId = transaction.OrderId,
                Status = transaction.Status
            };
            var transactionResponse = new TransactionResponse
            {
                Id = trans.Id,
                ReceiveMoney = trans.ReceiveMoney,
                PlatformFee = trans.PlatformFee,
                DepositBackMoney = trans.DepositBackMoney,
                OwnerReceiveMoney = trans.OwnerReceiveMoney,
                OrderId = transaction.OrderId,
                Status = transaction.Status
            };
            return CreatedAtAction("GetTransaction", new { id = trans.Id }, transactionResponse);
        }

        // DELETE: api/Transactions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var transaction = _unitOfWork.TransactionRepository.GetByID(id);
            if (transaction == null)
            {
                return NotFound();
            }

            _unitOfWork.TransactionRepository.Delete(transaction);
            _unitOfWork.Save();

            return NoContent();
        }

        private bool TransactionExists(int id)
        {
            return _unitOfWork.TransactionRepository.Get().Any(t => t.Id == id);
        }

        [HttpGet("order/{orderId}")]
        public ActionResult<IEnumerable<TransactionResponse>> GetTransactionsByOrderId(int orderId, int pageIndex = 1, int pageSize = 50)
        {
            var transactions = _unitOfWork.TransactionRepository.Get(
                trans => trans.OrderId == orderId,
                pageIndex: pageIndex, 
                pageSize: pageSize)
                .Select(transaction => new TransactionResponse
                 {
                     Id = transaction.Id,
                     ReceiveMoney = transaction.ReceiveMoney,
                     PlatformFee = transaction.PlatformFee,
                     OwnerReceiveMoney = transaction.OwnerReceiveMoney,
                     DepositBackMoney = transaction.DepositBackMoney,
                     OrderId = transaction.OrderId,
                 }).ToList();
            if (!transactions.Any())
            {
                return Ok(("Empty List"));
            }
            return Ok(transactions);
        }
    }
}
