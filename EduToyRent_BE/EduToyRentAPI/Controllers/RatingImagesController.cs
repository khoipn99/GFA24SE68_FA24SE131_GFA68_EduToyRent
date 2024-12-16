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
using EduToyRentAPI.FireBaseService;
using Microsoft.AspNetCore.OData.Query;

namespace EduToyRentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RatingImagesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        private readonly IFireBaseService _fireBaseService;

        public RatingImagesController(IUnitOfWork unitOfWork, IFireBaseService fireBaseService)
        {
            _unitOfWork = unitOfWork;
            _fireBaseService = fireBaseService;
        }

        // GET: api/RatingImages
        [HttpGet]
        public ActionResult<IEnumerable<RatingImageResponse>> GetRatingImages(int pageIndex = 1, int pageSize = 20)
        {
            var ratingImages = _unitOfWork.RatingImageRepository.Get(
                includeProperties: "Rating",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Select(r => new RatingImageResponse
                {
                    Id = r.Id,
                    MediaUrl = r.MediaUrl,
                    Status = r.Status,
                    RatingId = r.RatingId                    
                }).ToList();

            return Ok(ratingImages);
        }

        // GET: api/RatingImages/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RatingImageResponse>> GetRatingImage(int id)
        {
            var ratingImage = _unitOfWork.RatingImageRepository.GetByID(id);

            if (ratingImage == null)
            {
                return NotFound();
            }

            var ratingImageRes = new RatingImageResponse
            {
                Id = ratingImage.Id,
                Status = ratingImage.Status,
                MediaUrl = ratingImage.MediaUrl,
                RatingId = ratingImage.RatingId,
            };

            return Ok(ratingImageRes);
        }

        
        // POST: api/RatingImages
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<RatingImage>> UploadRatingImage([FromForm] List<IFormFile> ratingImageUrls, int ratingId)
        {
            var rating = _unitOfWork.RatingRepository.GetByID(ratingId);

            if (rating == null)
            {
                return NotFound();
            }

            if (ratingImageUrls.IsNullOrEmpty())
            {
                return BadRequest(new { Message = "No media were uploaded" });
            }

            var imageUrls = await _fireBaseService.UploadImagesAsync(ratingImageUrls);

            var ratingImages = imageUrls.Select(mediaUrl => new RatingImage
            {
                MediaUrl = mediaUrl,
                Status = "Active",
                RatingId = ratingId
            }).ToList();

            _unitOfWork.RatingImageRepository.InsertList(ratingImages);
            _unitOfWork.Save();

            var response = ratingImages.Select(rImage => new RatingImageResponse 
            {
                Id = rImage.Id,
                MediaUrl = rImage.MediaUrl,
                Status = rImage.Status,
                RatingId = rImage.RatingId
            });

            return Ok(response);
        }

        [HttpGet("rating/{ratingId}")]
        [EnableQuery]
        public ActionResult<IEnumerable<RatingImageResponse>> GetRatingImageByRatingId(int ratingId, int pageIndex = 1, int pageSize = 20)
        {
            var ratingImageResponses = _unitOfWork.RatingImageRepository.Get(
                rImage => rImage.RatingId == ratingId,
                includeProperties: "Rating",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(rImage => rImage.Id)
                .Select(rImage => new RatingImageResponse
                {
                    Id = rImage.Id,
                    MediaUrl = rImage.MediaUrl,
                    Status = rImage.Status,
                    RatingId = rImage.RatingId,
                });

            return Ok(ratingImageResponses);
        }

        // DELETE: api/RatingImages/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRatingImage(int ratingId)
        {
            var rating = _unitOfWork.RatingRepository.GetByID(ratingId);

            if (rating == null)
            {
                return NotFound();
            }

            var listRatingImages = _unitOfWork.RatingImageRepository.Get(
                rImage => rImage.RatingId == ratingId,
                includeProperties: "Rating").ToList();

            if (listRatingImages.IsNullOrEmpty())
            {
                return NotFound(new { Message = "This Rating have no media" });
            }

            var listMediaUrls = listRatingImages.Select(media => media.MediaUrl).ToList();

            await _fireBaseService.DeleteImagesAsync(listMediaUrls);

            _unitOfWork.RatingImageRepository.DeleteList(listRatingImages);
            _unitOfWork.Save();

            return Ok();
        }

        
    }
}
