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

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public OrdersController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/Orders
        [HttpGet]
        public ActionResult<IEnumerable<OrderResponse>> GetOrders(int pageIndex = 1, int pageSize = 20)
        {
            var orders = _unitOfWork.OrderRepository.Get(
                includeProperties: "User,Rating",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(orders => orders.Id)
                .Select(order => new OrderResponse
                {
                    Id = order.Id,
                    OrderDate = order.OrderDate,
                    ReceiveDate = order.ReceiveDate,
                    TotalPrice = order.TotalPrice,
                    RentPrice = order.RentPrice,
                    DepositeBackMoney = order.DepositeBackMoney,
                    ReceiveName = order.ReceiveName,
                    ReceiveAddress = order.ReceiveAddress,
                    ReceivePhone = order.ReceivePhone,
                    Status = order.Status,
                    UserId = order.UserId,
                    UserName = order.User.FullName,
                    RatingId = order.RatingId
                }).ToList();

            return Ok(orders);
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        public ActionResult<OrderResponse> GetOrder(int id)
        {
            var order = _unitOfWork.OrderRepository.GetByID(id);

            if (order == null)
            {
                return NotFound();
            }

            var orderResponse = new OrderResponse
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                ReceiveDate = order.ReceiveDate,
                TotalPrice = order.TotalPrice,
                RentPrice = order.RentPrice,
                DepositeBackMoney = order.DepositeBackMoney,
                ReceiveName = order.ReceiveName,
                ReceiveAddress = order.ReceiveAddress,
                ReceivePhone = order.ReceivePhone,
                Status = order.Status,
                UserId = order.UserId,
                UserName = order.User.FullName,
                RatingId = order.RatingId
            };

            return Ok(orderResponse);
        }

        // PUT: api/Orders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, OrderRequest orderRequest)
        {
            var order = _unitOfWork.OrderRepository.GetByID(id);

            if (order == null)
            {
                return NotFound();
            }

            order.OrderDate = orderRequest.OrderDate;
            order.ReceiveDate = orderRequest.ReceiveDate;
            order.TotalPrice = orderRequest.TotalPrice;
            order.RentPrice = orderRequest.RentPrice;
            order.DepositeBackMoney = orderRequest.DepositeBackMoney;
            order.ReceiveName = orderRequest.ReceiveName;
            order.ReceiveAddress = orderRequest.ReceiveAddress;
            order.ReceivePhone = orderRequest.ReceivePhone;
            order.Status = orderRequest.Status;
            order.UserId = orderRequest.UserId;
            order.RatingId = orderRequest.RatingId;

            _unitOfWork.OrderRepository.Update(order);

            try
            {
                _unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
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

        // POST: api/Orders
        [HttpPost]
        public async Task<ActionResult<OrderResponse>> PostOrder(OrderRequest orderRequest)
        {
            var order = new Order
            {
                OrderDate = DateTime.Now,
                ReceiveDate = orderRequest.ReceiveDate,
                TotalPrice = 0, // Xu ly cho nay khi hoan thanh OrderDetail
                RentPrice = orderRequest.RentPrice,
                DepositeBackMoney = orderRequest.DepositeBackMoney,
                ReceiveName = orderRequest.ReceiveName,
                ReceiveAddress = orderRequest.ReceiveAddress,
                ReceivePhone = orderRequest.ReceivePhone,
                Status = orderRequest.Status,
                UserId = orderRequest.UserId,
                RatingId = orderRequest.RatingId,
            };

            _unitOfWork.OrderRepository.Insert(order);
            _unitOfWork.Save();

            var orderResponse = new OrderResponse
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                ReceiveDate = order.ReceiveDate,
                TotalPrice = order.TotalPrice,
                RentPrice = order.RentPrice,
                DepositeBackMoney = order.DepositeBackMoney,
                ReceiveName = order.ReceiveName,
                ReceiveAddress = order.ReceiveAddress,
                ReceivePhone = order.ReceivePhone,
                Status = order.Status,
                UserId = order.UserId,
                UserName = order.User.FullName, 
                RatingId = order.RatingId
            };

            return CreatedAtAction("GetOrder", new { id = order.Id }, orderResponse);
        }

        // DELETE: api/Orders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = _unitOfWork.OrderRepository.GetByID(id);
            if (order == null)
            {
                return NotFound();
            }

            _unitOfWork.OrderRepository.Delete(order);
            _unitOfWork.Save();

            return NoContent();
        }
        // GET: api/Orders/ByUserId
        [HttpGet("ByUserId")]
        public ActionResult<IEnumerable<OrderResponse>> GetOrdersByUserId(int userId, int pageIndex = 1, int pageSize = 20)
        {
            var orders = _unitOfWork.OrderRepository.Get(
                includeProperties: "User,Rating",
                filter: o => o.UserId == userId,
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(o => o.Id)
                .Select(o => new OrderResponse
                {
                    Id = o.Id,
                    OrderDate = o.OrderDate,
                    ReceiveDate = o.ReceiveDate,
                    TotalPrice = o.TotalPrice,
                    RentPrice = o.RentPrice,
                    DepositeBackMoney = o.DepositeBackMoney,
                    ReceiveName = o.ReceiveName,
                    ReceiveAddress = o.ReceiveAddress,
                    ReceivePhone = o.ReceivePhone,
                    Status = o.Status,
                    UserId = o.UserId,
                    UserName = o.User.FullName,
                    RatingId = o.RatingId
                }).ToList();

            return Ok(orders);
        }
        private bool OrderExists(int id)
        {
            return _unitOfWork.OrderRepository.Get().Any(e => e.Id == id);
        }
    }
}
