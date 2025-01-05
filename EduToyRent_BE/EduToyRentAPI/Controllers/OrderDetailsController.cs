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
    public class OrderDetailsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public OrderDetailsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/OrderDetails
        [HttpGet]
        public ActionResult<IEnumerable<OrderDetailResponse>> GetOrderDetails(int pageIndex = 1, int pageSize = 50)
        {
            var orderDetails = _unitOfWork.OrderDetailRepository.Get(
                includeProperties: "Order,Toy,OrderType",
                pageIndex: pageIndex,
                pageSize: pageSize);

            var orderDetailResponses = orderDetails.Select(orderDetail =>
            {
                var mediaList = _unitOfWork.MediaRepository
                    .GetV2(m => m.ToyId == orderDetail.ToyId)
                    .Select(m => m.MediaUrl)
                    .ToList();
                var ReportVideoList = _unitOfWork.ReportRepository
                    .GetV2(m => m.OrderDetailId == orderDetail.Id)
                    .Select(m => m.VideoUrl)
                    .ToList();
                var OrderCheckImageList = _unitOfWork.OrderCheckImageRepository
                    .GetV2(m => m.OrderDetailId == orderDetail.Id)
                    .Select(m => m.MediaUrl)
                    .ToList();
                return new OrderDetailResponse
                {
                    Id = orderDetail.Id,
                    RentPrice = orderDetail.RentPrice??0,
                    Deposit = orderDetail.Deposit??0,
                    UnitPrice = orderDetail.UnitPrice,
                    Quantity = orderDetail.Quantity,
                    StartDate = orderDetail.StartDate,
                    EndDate = orderDetail.EndDate,
                    Fine = orderDetail.Fine,
                    RentCount = orderDetail.RentCount,
                    Status = orderDetail.Status,
                    OrderId = orderDetail.OrderId,
                    ToyId = orderDetail.ToyId,
                    ToyName = orderDetail.Toy.Name,
                    ToyPrice = orderDetail.Toy.Price,
                    ToyImgUrls = mediaList,
                    ReportVideoUrl = ReportVideoList,
                    OrderCheckImageUrl = OrderCheckImageList,
                    OrderTypeId = orderDetail.OrderTypeId,
                    RatingId = orderDetail.RatingId,
                };
            }).ToList();

            if (!orderDetailResponses.Any())
            {
                return NotFound();
            }

            return Ok(orderDetailResponses);
        }

        // GET: api/OrderDetails/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDetailResponse>> GetOrderDetail(int id)
        {
            var orderDetail = _unitOfWork.OrderDetailRepository.GetByID(id);

            if (orderDetail == null)
            {
                return NotFound();
            }

            var mediaList = _unitOfWork.MediaRepository
                .GetV2(m => m.ToyId == orderDetail.ToyId)
                .Select(m => m.MediaUrl)
                .ToList();
            var ReportVideoList = _unitOfWork.ReportRepository
                    .GetV2(m => m.OrderDetailId == orderDetail.Id)
                    .Select(m => m.VideoUrl)
                    .ToList();
            var OrderCheckImageList = _unitOfWork.OrderCheckImageRepository
                    .GetV2(m => m.OrderDetailId == orderDetail.Id)
                    .Select(m => m.MediaUrl)
                    .ToList();
            var orderDetailResponse = new OrderDetailResponse
            {
                Id = orderDetail.Id,
                RentPrice = (int)orderDetail.RentPrice,
                Deposit = (int)orderDetail.Deposit,
                UnitPrice = orderDetail.UnitPrice,
                Quantity = orderDetail.Quantity,
                StartDate = orderDetail.StartDate,
                EndDate = orderDetail.EndDate,
                Fine = orderDetail.Fine,
                RentCount = orderDetail.RentCount,
                Status = orderDetail.Status,
                OrderId = orderDetail.OrderId,
                ToyId = orderDetail.ToyId,
                ToyName = _unitOfWork.ToyRepository.GetByID(orderDetail.ToyId).Name,
                ToyPrice = _unitOfWork.ToyRepository.GetByID(orderDetail.ToyId).Price,
                ToyImgUrls = mediaList,
                ReportVideoUrl = ReportVideoList,
                OrderCheckImageUrl = OrderCheckImageList,
                OrderTypeId = orderDetail.OrderTypeId,
                RatingId = orderDetail.RatingId,
            };

            return Ok(orderDetailResponse);
        }

        // PUT: api/OrderDetails/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrderDetail(int id, OrderDetailRequest orderDetailRequest)
        {
            var orderDetail = _unitOfWork.OrderDetailRepository.GetByID(id);

            if (orderDetail == null)
            {
                return NotFound();
            }

            orderDetail.RentPrice = orderDetailRequest.RentPrice;
            orderDetail.Deposit = orderDetailRequest.Deposit;
            orderDetail.UnitPrice = orderDetailRequest.UnitPrice;
            orderDetail.Quantity = orderDetailRequest.Quantity;
            orderDetail.StartDate = orderDetailRequest.StartDate;
            orderDetail.EndDate = orderDetailRequest.EndDate;
            orderDetail.Fine = orderDetailRequest.Fine;
            orderDetail.RentCount = orderDetailRequest.RentCount;
            orderDetail.Status = orderDetailRequest.Status;
            orderDetail.OrderId = orderDetailRequest.OrderId;
            orderDetail.ToyId = orderDetailRequest.ToyId;
            orderDetail.OrderTypeId = orderDetailRequest.OrderTypeId;
            orderDetail.RatingId = orderDetailRequest.RatingId;
            _unitOfWork.OrderDetailRepository.Update(orderDetail);

            try
            {
                _unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderDetailExists(id))
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

        // POST: api/OrderDetails
        [HttpPost]
        public async Task<ActionResult<OrderDetailResponse>> PostOrderDetail(OrderDetailRequest orderDetailRequest)
        {
            var orderDetail = new OrderDetail
            {
                RentPrice = orderDetailRequest.RentPrice,
                Deposit = orderDetailRequest.Deposit,
                UnitPrice = orderDetailRequest.UnitPrice,
                Quantity = orderDetailRequest.Quantity,
                StartDate = orderDetailRequest.StartDate,
                EndDate = orderDetailRequest.EndDate,
                Fine = orderDetailRequest.Fine,
                RentCount = orderDetailRequest.RentCount,
                Status = orderDetailRequest.Status,
                OrderId = orderDetailRequest.OrderId,
                ToyId = orderDetailRequest.ToyId,
                OrderTypeId = orderDetailRequest.OrderTypeId
            };

            _unitOfWork.OrderDetailRepository.Insert(orderDetail);
            var order = _unitOfWork.OrderRepository.GetByID(orderDetailRequest.OrderId);
            var toy = _unitOfWork.ToyRepository.GetByID(orderDetailRequest.ToyId);
            /*if (toy.BuyQuantity < 0)
            {
                orderDetail.Quantity = -1;
                order.TotalPrice += (orderDetail.UnitPrice * 1);
            }
            else
            {
                order.TotalPrice += (orderDetail.UnitPrice * orderDetail.Quantity);
            }

            _unitOfWork.OrderRepository.Update(order);*/
            _unitOfWork.Save();

            var orderDetailResponse = new OrderDetailResponse
            {
                Id = orderDetail.Id,
                RentPrice = (int)orderDetail.RentPrice,
                Deposit = (int)orderDetail.Deposit,
                UnitPrice = orderDetail.UnitPrice,
                Quantity = orderDetail.Quantity,
                StartDate = orderDetail.StartDate,
                EndDate = orderDetail.EndDate,
                Fine = orderDetail.Fine,
                RentCount = orderDetail.RentCount,
                Status = orderDetail.Status,
                OrderId = orderDetail.OrderId,
                ToyId = orderDetail.ToyId,
                OrderTypeId = orderDetail.OrderTypeId,
                RatingId = orderDetail.RatingId,
            };

            return CreatedAtAction("GetOrderDetail", new { id = orderDetail.Id }, orderDetailResponse);
        }

        // DELETE: api/OrderDetails/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderDetail(int id)
        {
            var orderDetail = _unitOfWork.OrderDetailRepository.GetByID(id);
            if (orderDetail == null)
            {
                return NotFound();
            }

            //tru gia 
            var order = _unitOfWork.OrderRepository.GetByID(orderDetail.OrderId);
            if (order != null)
            {
                if (orderDetail.Quantity < 0)
                {
                    order.TotalPrice -= (orderDetail.UnitPrice);
                }
                else
                {
                    order.TotalPrice -= (orderDetail.UnitPrice * orderDetail.Quantity);
                }
                _unitOfWork.OrderRepository.Update(order);
            }

            _unitOfWork.OrderDetailRepository.Delete(orderDetail);
            _unitOfWork.Save();

            return NoContent();
        }

        // GET: api/OrderDetails/byToy/{toyId}
        [HttpGet("byToy/{toyId}")]
        public ActionResult<IEnumerable<OrderDetailResponse>> GetOrderDetailsByToyId(int toyId, int pageIndex = 1, int pageSize = 50)
        {
            var orderDetails = _unitOfWork.OrderDetailRepository.Get(
                filter: od => od.ToyId == toyId,
                includeProperties: "Order,Toy,OrderType",
                pageIndex: pageIndex,
                pageSize: pageSize);
            var orderDetailResponses = orderDetails.Select(orderDetail =>
            {
                var mediaList = _unitOfWork.MediaRepository
                        .GetV2(m => m.ToyId == orderDetail.ToyId)
                        .Select(m => m.MediaUrl)
                        .ToList();
                var ReportVideoList = _unitOfWork.ReportRepository
                    .GetV2(m => m.OrderDetailId == orderDetail.Id)
                    .Select(m => m.VideoUrl)
                    .ToList();
                var OrderCheckImageList = _unitOfWork.OrderCheckImageRepository
                    .GetV2(m => m.OrderDetailId == orderDetail.Id)
                    .Select(m => m.MediaUrl)
                    .ToList();
                return new OrderDetailResponse
                {
                    Id = orderDetail.Id,
                    RentPrice = (int)orderDetail.RentPrice,
                    Deposit = (int)orderDetail.Deposit,
                    UnitPrice = orderDetail.UnitPrice,
                    Quantity = orderDetail.Quantity,
                    StartDate = orderDetail.StartDate,
                    EndDate = orderDetail.EndDate,
                    Fine = orderDetail.Fine,
                    RentCount = orderDetail.RentCount,
                    Status = orderDetail.Status,
                    OrderId = orderDetail.OrderId,
                    ToyId = orderDetail.ToyId,
                    ToyName = orderDetail.Toy.Name,
                    ToyPrice = orderDetail.Toy.Price,
                    ToyImgUrls = mediaList,
                    ReportVideoUrl = ReportVideoList,
                    OrderCheckImageUrl = OrderCheckImageList,
                    OrderTypeId = orderDetail.OrderTypeId,
                    RatingId = orderDetail.RatingId
                };
            }).ToList();

            if (!orderDetails.Any())
            {
                return NotFound();
            }

            return Ok(orderDetailResponses);
        }
        // GET: api/OrderDetails/Order/5
        [HttpGet("Order/{orderId}")]
        public async Task<ActionResult<IEnumerable<OrderDetailResponse>>> GetOrderDetailsByOrderId(int orderId)
        {
            var orderDetails = _unitOfWork.OrderDetailRepository.Get(filter: od => od.OrderId == orderId, includeProperties: "Toy").ToList();

            if (orderDetails == null || !orderDetails.Any())
            {
                return NotFound("Not found!!!");
            }

            var orderDetailResponses = orderDetails.Select(orderDetail =>
            {
                var mediaList = _unitOfWork.MediaRepository
                        .GetV2(m => m.ToyId == orderDetail.ToyId)
                        .Select(m => m.MediaUrl)
                        .ToList();
                var ReportVideoList = _unitOfWork.ReportRepository
                    .GetV2(m => m.OrderDetailId == orderDetail.Id)
                    .Select(m => m.VideoUrl)
                    .ToList();
                var OrderCheckImageList = _unitOfWork.OrderCheckImageRepository
                    .GetV2(m => m.OrderDetailId == orderDetail.Id)
                    .Select(m => m.MediaUrl)
                    .ToList();
                return new OrderDetailResponse
                {
                    Id = orderDetail.Id,
                    RentPrice = orderDetail.RentPrice??0,
                    Deposit = orderDetail.Deposit ?? 0,
                    UnitPrice = orderDetail.UnitPrice,
                    Quantity = orderDetail.Quantity,
                    StartDate = orderDetail.StartDate,
                    EndDate = orderDetail.EndDate,
                    Fine = orderDetail.Fine,
                    RentCount = orderDetail.RentCount,
                    Status = orderDetail.Status,
                    OrderId = orderDetail.OrderId,
                    ToyId = orderDetail.ToyId,
                    ToyName = orderDetail.Toy.Name,
                    ToyPrice = orderDetail.Toy.Price,
                    ToyImgUrls = mediaList,
                    ReportVideoUrl = ReportVideoList,
                    OrderCheckImageUrl = OrderCheckImageList,
                    OrderTypeId = orderDetail.OrderTypeId,
                    RatingId = orderDetail.RatingId
                };
            }).ToList();
            return Ok(orderDetailResponses);
        }
        // GET: api/OrderDetails/User/{userId}
        [HttpGet("User/{userId}")]
        public async Task<ActionResult<IEnumerable<OrderDetailResponse>>> GetOrderDetailsByUserId(int userId)
        {
            var orderDetails = _unitOfWork.OrderDetailRepository.Get(filter: od => od.Toy.UserId == userId, includeProperties: "Toy");

            if (orderDetails == null || !orderDetails.Any())
            {
                return NotFound("No order details found own by this user.");
            }

            var orderDetailResponses = orderDetails.Select(orderDetail =>
            {
                var mediaList = _unitOfWork.MediaRepository
                        .GetV2(m => m.ToyId == orderDetail.ToyId)
                        .Select(m => m.MediaUrl)
                        .ToList();
                var ReportVideoList = _unitOfWork.ReportRepository
                    .GetV2(m => m.OrderDetailId == orderDetail.Id)
                    .Select(m => m.VideoUrl)
                    .ToList();
                var OrderCheckImageList = _unitOfWork.OrderCheckImageRepository
                    .GetV2(m => m.OrderDetailId == orderDetail.Id)
                    .Select(m => m.MediaUrl)
                    .ToList();
                return new OrderDetailResponse
                {
                    Id = orderDetail.Id,
                    RentPrice = (int)orderDetail.RentPrice,
                    Deposit = (int)orderDetail.Deposit,
                    UnitPrice = orderDetail.UnitPrice,
                    Quantity = orderDetail.Quantity,
                    StartDate = orderDetail.StartDate,
                    EndDate = orderDetail.EndDate,
                    Fine = orderDetail.Fine,
                    RentCount = orderDetail.RentCount,
                    Status = orderDetail.Status,
                    OrderId = orderDetail.OrderId,
                    ToyId = orderDetail.ToyId,
                    ToyName = orderDetail.Toy.Name,
                    ToyPrice = orderDetail.Toy.Price,
                    ToyImgUrls = mediaList,
                    ReportVideoUrl = ReportVideoList,
                    OrderCheckImageUrl = OrderCheckImageList,
                    OrderTypeId = orderDetail.OrderTypeId,
                    RatingId = orderDetail.RatingId
                };
            }).ToList();

            return Ok(orderDetailResponses);
        }
        // Chuyển process sang expired
        [HttpPut("UpdateExpiredStatus")]
        public async Task<IActionResult> UpdateExpiredStatusForOrderDetails()
        {
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var currentDate = TimeZoneInfo.ConvertTime(DateTime.Now, vietnamTimeZone);

            var orderDetails = _unitOfWork.OrderDetailRepository.Get(
                filter: od => od.Status == "Processing" && od.EndDate <= currentDate).ToList();

            if (!orderDetails.Any())
            {
                return Ok("No OrderDetails to update.");
            }

            foreach (var orderDetail in orderDetails)
            {
                orderDetail.Status = "Expired";
                _unitOfWork.OrderDetailRepository.Update(orderDetail);
            }

            _unitOfWork.Save();

            return Ok($"Updated {orderDetails.Count} OrderDetails to Expired status.");
        }
        private bool OrderDetailExists(int id)
        {
            return _unitOfWork.OrderDetailRepository.Get().Any(e => e.Id == id);
        }
    }

}
