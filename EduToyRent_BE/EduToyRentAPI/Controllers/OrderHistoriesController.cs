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
using System.Security.Claims;

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class OrderHistoryController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public OrderHistoryController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/OrderHistory
        [HttpGet]
        public ActionResult<IEnumerable<OrderHistoryResponse>> GetOrderHistories(int pageIndex = 1, int pageSize = 50)
        {
            var orderHistories = _unitOfWork.OrderHistoryRepository.Get(
                includeProperties: "OrderDetail,User",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Select(orderHistory => new OrderHistoryResponse
                {
                    Id = orderHistory.Id,
                    Reason = orderHistory.Reason,
                    UpdateDate = orderHistory.UpdateDate,
                    Status = orderHistory.Status,
                    OrderDetailId = orderHistory.OrderDetailId,  
                    UserUpdateId = orderHistory.UserUpdateId
                }).ToList();

            return Ok(orderHistories);
        }

        // GET: api/OrderHistory/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderHistoryResponse>> GetOrderHistory(int id)
        {
            var orderHistory = _unitOfWork.OrderHistoryRepository.GetByID(id);

            if (orderHistory == null)
            {
                return NotFound();
            }

            var orderHistoryResponse = new OrderHistoryResponse
            {
                Id = orderHistory.Id,
                Reason = orderHistory.Reason,
                UpdateDate = orderHistory.UpdateDate,
                Status = orderHistory.Status,
                OrderDetailId = orderHistory.OrderDetailId,  
                UserUpdateId = orderHistory.UserUpdateId
            };

            return Ok(orderHistoryResponse);
        }

        // POST: api/OrderHistory
        [HttpPost]
        public async Task<ActionResult<OrderHistoryResponse>> PostOrderHistory(OrderHistoryRequest orderHistoryRequest)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userUpdateId))
            {
                return Unauthorized(new { Message = "Invalid or missing user ID from token." });
            }

            var orderHistory = new OrderHistory
            {
                Reason = orderHistoryRequest.Reason,
                UpdateDate = DateTime.Now,
                Status = orderHistoryRequest.Status,
                OrderDetailId = orderHistoryRequest.OrderDetailId,
                UserUpdateId = userUpdateId 
            };

            _unitOfWork.OrderHistoryRepository.Insert(orderHistory);
            _unitOfWork.Save();

            var orderHistoryResponse = new OrderHistoryResponse
            {
                Id = orderHistory.Id,
                Reason = orderHistory.Reason,
                UpdateDate = orderHistory.UpdateDate,
                Status = orderHistory.Status,
                OrderDetailId = orderHistory.OrderDetailId,
                UserUpdateId = orderHistory.UserUpdateId
            };

            return CreatedAtAction("GetOrderHistory", new { id = orderHistory.Id }, orderHistoryResponse);
        }


        // PUT: api/OrderHistory/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrderHistory(int id, OrderHistoryRequest orderHistoryRequest)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userUpdateId))
            {
                return Unauthorized(new { Message = "Invalid or missing user ID from token." });
            }

            
            var orderHistory = _unitOfWork.OrderHistoryRepository.GetByID(id);

            if (orderHistory == null)
            {
                return NotFound();
            }

            orderHistory.Reason = orderHistoryRequest.Reason;
            orderHistory.Status = orderHistoryRequest.Status;
            orderHistory.OrderDetailId = orderHistoryRequest.OrderDetailId;
            orderHistory.UserUpdateId = userUpdateId; 
            orderHistory.UpdateDate = DateTime.Now;

            _unitOfWork.OrderHistoryRepository.Update(orderHistory);

            try
            {
                _unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderHistoryExists(id))
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


        // DELETE: api/OrderHistory/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderHistory(int id)
        {
            var orderHistory = _unitOfWork.OrderHistoryRepository.GetByID(id);
            if (orderHistory == null)
            {
                return NotFound();
            }

            _unitOfWork.OrderHistoryRepository.Delete(orderHistory);
            _unitOfWork.Save();

            return NoContent();
        }
        // GET: api/OrderHistory/byOrderDetailId/{orderDetailId}
        [HttpGet("byOrderDetailId/{orderDetailId}")]
        public ActionResult<IEnumerable<OrderHistoryResponse>> GetByOrderDetailId(int orderDetailId, int pageIndex = 1, int pageSize = 50)
        {
            var orderHistories = _unitOfWork.OrderHistoryRepository.Get(
                filter: oh => oh.OrderDetailId == orderDetailId,  
                includeProperties: "OrderDetail,User",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Select(orderHistory => new OrderHistoryResponse
                {
                    Id = orderHistory.Id,
                    Reason = orderHistory.Reason,
                    UpdateDate = orderHistory.UpdateDate,
                    Status = orderHistory.Status,
                    OrderDetailId = orderHistory.OrderDetailId,  
                    UserUpdateId = orderHistory.UserUpdateId
                }).ToList();

            if (orderHistories == null || !orderHistories.Any())
            {
                return NotFound();
            }

            return Ok(orderHistories);
        }
        // GET: api/OrderHistory/byUserUpdateId/{userUpdateId}
        [HttpGet("byUserUpdateId/{userUpdateId}")]
        public ActionResult<IEnumerable<OrderHistoryResponse>> GetByUserUpdateId(int userUpdateId, int pageIndex = 1, int pageSize = 50)
        {
            var orderHistories = _unitOfWork.OrderHistoryRepository.Get(
                filter: oh => oh.UserUpdateId == userUpdateId,  
                includeProperties: "OrderDetail,User",  
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Select(orderHistory => new OrderHistoryResponse
                {
                    Id = orderHistory.Id,
                    Reason = orderHistory.Reason,
                    UpdateDate = orderHistory.UpdateDate,
                    Status = orderHistory.Status,
                    OrderDetailId = orderHistory.OrderDetailId,
                    UserUpdateId = orderHistory.UserUpdateId
                }).ToList();

            if (orderHistories == null || !orderHistories.Any())
            {
                return NotFound(new { Message = "No order histories found for the given UserUpdateId." });
            }

            return Ok(new
            {   UserUpdateName = _unitOfWork.UserRepository.GetByID(userUpdateId).FullName,
                orderHistories
            });
        }

        private bool OrderHistoryExists(int id)
        {
            return _unitOfWork.OrderHistoryRepository.Get().Any(e => e.Id == id);
        }
    }
}
