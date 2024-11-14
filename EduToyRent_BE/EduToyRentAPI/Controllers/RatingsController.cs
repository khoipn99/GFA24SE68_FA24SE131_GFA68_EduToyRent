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
    public class RatingsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public RatingsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/Ratings
        [HttpGet]
        public ActionResult<IEnumerable<RatingResponse>> GetRatings(int pageIndex = 1, int pageSize = 20)
        {
            var ratings = _unitOfWork.RatingRepository.Get(
                includeProperties: "User,Order",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Select(rating => new RatingResponse
                {
                    Id = rating.Id,
                    Comment = rating.Comment,
                    Star = rating.Star,
                    UserId = rating.UserId,
                    RatingDate = rating.RatingDate,
                    UserName = rating.User.FullName,
                    OrderDetailId = rating.OrderDetailId
                }).ToList();

            return Ok(ratings);
        }

        // GET: api/Ratings/5
        [HttpGet("{id}")]
        public ActionResult<RatingResponse> GetRating(int id)
        {
            var rating = _unitOfWork.RatingRepository.GetByID(id);

            if (rating == null)
            {
                return NotFound();
            }

            var ratingResponse = new RatingResponse
            {
                Id = rating.Id,
                Comment = rating.Comment,
                Star = rating.Star,
                UserId = rating.UserId,
                RatingDate = rating.RatingDate,
                UserName = rating.User.FullName,
                OrderDetailId = rating.OrderDetailId
            };

            return Ok(ratingResponse);
        }

        // PUT: api/Ratings/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRating(int id, RatingRequest ratingRequest)
        {
            var rating = _unitOfWork.RatingRepository.GetByID(id);

            if (rating == null)
            {
                return NotFound();
            }

            rating.Comment = ratingRequest.Comment;
            rating.Star = ratingRequest.Star;

            _unitOfWork.RatingRepository.Update(rating);

            try
            {
                _unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RatingExists(id))
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

        // POST: api/Ratings
        [HttpPost]
        public async Task<ActionResult<RatingResponse>> PostRating(RatingRequest ratingRequest)
        {
            var orderDetail = _unitOfWork.OrderDetailRepository.GetByID(ratingRequest.OrderDetailId);
            if (orderDetail == null)
            {
                return BadRequest("Order detail not found");
            }
            var rating = new Rating
            {
                Comment = ratingRequest.Comment,
                Star = ratingRequest.Star,
                UserId = ratingRequest.UserId,
                OrderDetailId = ratingRequest.OrderDetailId,
                RatingDate = DateTime.Now
            };
            _unitOfWork.RatingRepository.Insert(rating);

            var ratingsForToy = _unitOfWork.RatingRepository.Get(filter: r => r.OrderDetail.ToyId == orderDetail.ToyId);
            int countRatingsForToy = ratingsForToy.Count();
            float totalStarsForToy = ratingsForToy.Sum(r => r.Star);
            float averageRating = countRatingsForToy > 0 ? (float)totalStarsForToy / countRatingsForToy : 0;

            averageRating = (float)Math.Round(averageRating, 1);

            var toy = _unitOfWork.ToyRepository.GetByID(orderDetail.ToyId);
            if (toy != null)
            {
                toy.Star =(float) averageRating;
                _unitOfWork.ToyRepository.Update(toy); 
            }
            _unitOfWork.Save();
            var ratingResponse = new RatingResponse
            {
                Id = rating.Id,
                Comment = rating.Comment,
                Star = rating.Star,
                UserId = rating.UserId,
                RatingDate = rating.RatingDate,
                UserName = _unitOfWork.UserRepository.GetByID(rating.UserId).FullName,
                OrderDetailId = rating.OrderDetailId
            };

            return CreatedAtAction("GetRating", new { id = rating.Id }, ratingResponse);
        }

        // DELETE: api/Ratings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRating(int id)
        {
            var rating = _unitOfWork.RatingRepository.GetByID(id);
            if (rating == null)
            {
                return NotFound();
            }

            _unitOfWork.RatingRepository.Delete(rating);
            _unitOfWork.Save();

            return NoContent();
        }
        [HttpGet("ByToyId/{toyId}")]
        public ActionResult<IEnumerable<RatingResponse>> GetRatingsByToyId(int toyId)
        {
            var ratings = _unitOfWork.RatingRepository.Get(
                filter: r => r.OrderDetail.ToyId == toyId,
                includeProperties: "OrderDetail,User")
                .Select(r => new RatingResponse
                {
                    Id = r.Id,
                    Comment = r.Comment,
                    Star = r.Star,
                    UserId = r.UserId,
                    RatingDate = r.RatingDate,
                    UserName = r.User.FullName,
                    OrderDetailId = r.OrderDetailId
                }).ToList();

            if (ratings == null || !ratings.Any())
            {
                return NotFound(new { Message = $"No ratings found for toy with ID {toyId}" });
            }

            return Ok(ratings);
        }

        private bool RatingExists(int id)
        {
            return _unitOfWork.RatingRepository.Get().Any(e => e.Id == id);
        }
    }
}
