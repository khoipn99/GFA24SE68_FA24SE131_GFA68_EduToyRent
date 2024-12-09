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
using Google.Apis.Storage.v1.Data;

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
           var transactions = _unitOfWork.TransactionRepository.Get(
               includeProperties: "Order,Order.User,Order.OrderDetails.Toy",
               pageIndex: pageIndex, 
               pageSize: pageSize)
                .OrderByDescending(t => t.Id)
                .Select(transaction => new TransactionResponse
                {
                    Id = transaction.Id,
                    ReceiveMoney = (float)transaction.ReceiveMoney,
                    PlatformFee = (float)transaction.PlatformFee,
                    OwnerReceiveMoney = (float)transaction.OwnerReceiveMoney,
                    DepositBackMoney = (float)transaction.DepositBackMoney,
                    Date = transaction.Date ?? DateTime.MinValue,
                    Status = transaction.Status,
                    Order = new OrderResponse
                    {
                        Id = transaction.OrderId,
                        OrderDate = transaction.Order.OrderDate,
                        ReceiveDate = transaction.Order.ReceiveDate,
                        TotalPrice = transaction.Order.TotalPrice,
                        RentPrice = (int)(float)transaction.Order.RentPrice,
                        DepositeBackMoney = (int)transaction.Order.DepositeBackMoney,
                        ReceiveName = transaction.Order.ReceiveName,
                        ReceiveAddress = transaction.Order.ReceiveAddress,
                        ReceivePhone = transaction.Order.ReceivePhone,
                        Status = transaction.Order.Status,
                        UserId = transaction.Order.UserId,
                        UserName = transaction.Order.User.FullName,
                        ShopId = transaction.Order.OrderDetails.FirstOrDefault().Toy.UserId,
                        ShopName = _unitOfWork.UserRepository.GetByID(transaction.Order.OrderDetails.FirstOrDefault().Toy.UserId).FullName
                    },
                }).ToList();

            if (!transactions.Any())
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

            var order = _unitOfWork.OrderRepository.GetByID(transaction.OrderId);
            var user = _unitOfWork.UserRepository.GetByID(order.UserId);
            var orderDetail = _unitOfWork.OrderDetailRepository.Get(
                od => od.OrderId == order.Id,
                includeProperties: "Toy").FirstOrDefault();

            var transactionRespone = new TransactionResponse
            {
                Id = transaction.Id,
                ReceiveMoney = (float)transaction.ReceiveMoney,
                PlatformFee = (float)transaction.PlatformFee,
                OwnerReceiveMoney = (float)transaction.OwnerReceiveMoney,
                DepositBackMoney = (float)transaction.DepositBackMoney,
                Date = transaction.Date ?? DateTime.MinValue,
                Status = transaction.Status,
                Order = new OrderResponse
                {
                    Id = order.Id,
                    OrderDate = order.OrderDate,
                    ReceiveDate = order.ReceiveDate,
                    TotalPrice = order.TotalPrice,
                    RentPrice = (int)order.RentPrice,
                    DepositeBackMoney = (int)order.DepositeBackMoney,
                    ReceiveName = order.ReceiveName,
                    ReceiveAddress = order.ReceiveAddress,
                    ReceivePhone = order.ReceivePhone,
                    Status = order.Status,
                    UserId = order.UserId,
                    UserName = user.FullName,
                    ShopId = orderDetail.Toy.UserId,
                    ShopName = _unitOfWork.UserRepository.GetByID(orderDetail.Toy.UserId).FullName
                },
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
            trans.Status = transaction.Status;
            trans.OrderId = transaction.OrderId;
            trans.Date = DateTime.Now;

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
                Date = DateTime.Now,
                Status = transaction.Status
            };

            _unitOfWork.TransactionRepository.Insert(trans);
            _unitOfWork.Save();

            var order = _unitOfWork.OrderRepository.GetByID(trans.OrderId);
            var user = _unitOfWork.UserRepository.GetByID(order.UserId);
            var orderDetail = _unitOfWork.OrderDetailRepository.Get(
                od => od.OrderId == order.Id,
                includeProperties: "Toy").FirstOrDefault();

            var transactionRespone = new TransactionResponse
            {
                Id = trans.Id,
                ReceiveMoney = (float)trans.ReceiveMoney,
                PlatformFee = (float)trans.PlatformFee,
                OwnerReceiveMoney = (float)trans.OwnerReceiveMoney,
                DepositBackMoney = (float)trans.DepositBackMoney,
                Date = trans.Date ?? DateTime.MinValue,
                Status = trans.Status,
                Order = new OrderResponse
                {
                    Id = order.Id,
                    OrderDate = order.OrderDate,
                    ReceiveDate = order.ReceiveDate,
                    TotalPrice = order.TotalPrice,
                    RentPrice = (int)order.RentPrice,
                    DepositeBackMoney = (int)order.DepositeBackMoney,
                    ReceiveName = order.ReceiveName,
                    ReceiveAddress = order.ReceiveAddress,
                    ReceivePhone = order.ReceivePhone,
                    Status = order.Status,
                    UserId = order.UserId,
                    UserName = user.FullName,
                    ShopId = orderDetail.Toy.UserId,
                    ShopName = _unitOfWork.UserRepository.GetByID(orderDetail.Toy.UserId).FullName
                },
            };

            return CreatedAtAction("GetTransaction", new { id = trans.Id }, transactionRespone);
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
                includeProperties: "Order,Order.User,Order.OrderDetails.Toy",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(t => t.Id)
                .Select(transaction => new TransactionResponse
                {
                    Id = transaction.Id,
                    ReceiveMoney = (float)transaction.ReceiveMoney,
                    PlatformFee = (float)transaction.PlatformFee,
                    OwnerReceiveMoney = (float)transaction.OwnerReceiveMoney,
                    DepositBackMoney = (float)transaction.DepositBackMoney,
                    Date = transaction.Date ?? DateTime.MinValue,
                    Status = transaction.Status,
                    Order = new OrderResponse
                    {
                        Id = transaction.OrderId,
                        OrderDate = transaction.Order.OrderDate,
                        ReceiveDate = transaction.Order.ReceiveDate,
                        TotalPrice = transaction.Order.TotalPrice,
                        RentPrice = (int)transaction.Order.RentPrice,
                        DepositeBackMoney = (int)transaction.Order.DepositeBackMoney,
                        ReceiveName = transaction.Order.ReceiveName,
                        ReceiveAddress = transaction.Order.ReceiveAddress,
                        ReceivePhone = transaction.Order.ReceivePhone,
                        Status = transaction.Order.Status,
                        UserId = transaction.Order.UserId,
                        UserName = transaction.Order.User.FullName,
                        ShopId = transaction.Order.OrderDetails.FirstOrDefault().Toy.UserId,
                        ShopName = _unitOfWork.UserRepository.GetByID(transaction.Order.OrderDetails.FirstOrDefault().Toy.UserId).FullName
                    },
                }).ToList();

            if (!transactions.Any())
            {
                return Ok(("Empty List"));
            }

            return Ok(transactions);
        }


    }
}
