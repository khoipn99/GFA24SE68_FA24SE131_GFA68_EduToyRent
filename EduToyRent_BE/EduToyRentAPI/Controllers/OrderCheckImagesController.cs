using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduToyRentRepositories.Models;
using EduToyRentAPI.FireBaseService;
using EduToyRentRepositories.Interface;
using EduToyRentRepositories.DTO.Response;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.IdentityModel.Tokens;

namespace EduToyRentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderCheckImagesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        private readonly IFireBaseService _fireBaseService;

        public OrderCheckImagesController(IUnitOfWork unitOfWork, IFireBaseService fireBaseService)
        {
            _unitOfWork = unitOfWork;
            _fireBaseService = fireBaseService;
        }

        // GET: api/RatingImages
        [HttpGet]
        [EnableQuery]
        public ActionResult<IEnumerable<OrderCheckImageResponse>> GetOrderCheckImages(int pageIndex = 1, int pageSize = 20)
        {
            var orderCheckImages = _unitOfWork.OrderCheckImageRepository.Get(
                includeProperties: "OrderDetail",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Select(o => new OrderCheckImageResponse
                {
                    Id = o.Id,
                    MediaUrl = o.MediaUrl,
                    Status = o.Status,
                    OrderDetailId = o.OrderDetailId
                }).ToList();

            return Ok(orderCheckImages);
        }

        // GET: api/RatingImages/5
        [HttpGet("{id}")]
        [EnableQuery]
        public async Task<ActionResult<OrderCheckImageResponse>> GetOrderCheckImage(int id)
        {
            var orderCheckImage = _unitOfWork.OrderCheckImageRepository.GetByID(id);

            if (orderCheckImage == null)
            {
                return NotFound();
            }

            var checkImageRes = new OrderCheckImageResponse
            {
                Id = orderCheckImage.Id,
                Status = orderCheckImage.Status,
                MediaUrl = orderCheckImage.MediaUrl,
                OrderDetailId = orderCheckImage.OrderDetailId,
            };

            return Ok(checkImageRes);
        }


        // POST: api/RatingImages
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<OrderCheckImage>> UploadOrderCheckImage([FromForm] List<IFormFile> checkImageUrls, int orderDetailId, string status)
        {
            var orderDetail = _unitOfWork.OrderDetailRepository.GetByID(orderDetailId);

            if (orderDetail == null)
            {
                return NotFound();
            }

            if (checkImageUrls.IsNullOrEmpty())
            {
                return BadRequest(new { Message = "No media were uploaded" });
            }

            var imageUrls = await _fireBaseService.UploadImagesAsync(checkImageUrls);
            status = string.IsNullOrEmpty(status) ? "Active" : status;

            var checkImages = imageUrls.Select(mediaUrl => new OrderCheckImage
            {
                MediaUrl = mediaUrl,
                Status = status,
                OrderDetailId = orderDetailId
            }).ToList();

            _unitOfWork.OrderCheckImageRepository.InsertList(checkImages);
            _unitOfWork.Save();

            var response = checkImages.Select(rImage => new OrderCheckImageResponse
            {
                Id = rImage.Id,
                MediaUrl = rImage.MediaUrl,
                Status = rImage.Status,
                OrderDetailId = rImage.OrderDetailId
            });

            return Ok(response);
        }

        [HttpGet("order-detail/{orderDetailId}")]
        [EnableQuery]
        public ActionResult<IEnumerable<OrderCheckImageResponse>> GetOrderCheckImageByOrderDetailId(int orderDetailId, int pageIndex = 1, int pageSize = 20)
        {
            var checkImageResponses = _unitOfWork.OrderCheckImageRepository.Get(
                cImage => cImage.OrderDetailId == orderDetailId,
                includeProperties: "OrderDetail",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(cImage => cImage.Id)
                .Select(rImage => new OrderCheckImageResponse
                {
                    Id = rImage.Id,
                    MediaUrl = rImage.MediaUrl,
                    Status = rImage.Status,
                    OrderDetailId = rImage.OrderDetailId,
                });

            return Ok(checkImageResponses);
        }

        // DELETE: api/RatingImages/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderCheckImage(int orderDetailId)
        {
            var orderDetail = _unitOfWork.OrderCheckImageRepository.GetByID(orderDetailId);

            if (orderDetail == null)
            {
                return NotFound();
            }

            var listCheckImages = _unitOfWork.OrderCheckImageRepository.Get(
                cImage => cImage.OrderDetailId == orderDetailId,
                includeProperties: "OrderDetail").ToList();

            if (listCheckImages.IsNullOrEmpty())
            {
                return NotFound(new { Message = "This OrderDetail have no media" });
            }

            var listMediaUrls = listCheckImages.Select(media => media.MediaUrl).ToList();

            await _fireBaseService.DeleteImagesAsync(listMediaUrls);

            _unitOfWork.OrderCheckImageRepository.DeleteList(listCheckImages);
            _unitOfWork.Save();

            return Ok();
        }
    }
}
