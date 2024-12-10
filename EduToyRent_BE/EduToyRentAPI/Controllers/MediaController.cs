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
using Mapster;
using EduToyRentRepositories.DTO.Request;
using EduToyRentAPI.FireBaseService;
using Microsoft.AspNetCore.OData.Query;
using System.Drawing.Printing;
using Microsoft.IdentityModel.Tokens;

namespace EduToyRentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MediaController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        private readonly IFireBaseService _fireBaseService;

        public MediaController(IUnitOfWork unitOfWork, IFireBaseService fireBaseService)
        {
            _unitOfWork = unitOfWork;
            _fireBaseService = fireBaseService;
        }

        // GET: api/Media
        [HttpGet]
        [EnableQuery]
        public ActionResult<IEnumerable<MediaResponse>> GetMedia(int pageIndex = 1, int pageSize = 20)
        {
            var mediaResponses = _unitOfWork.MediaRepository.Get(
                includeProperties: "Toy",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(media => media.Id)
                .Select(media => new MediaResponse
                {
                    Id = media.Id,
                    MediaUrl = media.MediaUrl,
                    Status = media.Status,
                    ToyId = media.ToyId,
                });
             
            return Ok(mediaResponses);
        }

        // GET: api/Media/5
        [HttpGet("{id}")]
        [EnableQuery]
        public async Task<ActionResult<Media>> GetMedia(int id)
        {
            var media = _unitOfWork.MediaRepository.GetByID(id);

            if (media == null)
            {
                return NotFound();
            }

            var mediaResponse = new MediaResponse
            {
                Id= media.Id,
                MediaUrl = media.MediaUrl,
                Status = media.Status,
                ToyId = media.ToyId,
            };

            return Ok(mediaResponse);
        } 

        //POST: api/Media/upload-toy-media/5
        [HttpPost("upload-toy-media/{toyId}")]
        [EnableQuery]
        public async Task<IActionResult> UploadToyMedia([FromForm] List<IFormFile> mediaUrls, int toyId)
        {
            var toy = _unitOfWork.ToyRepository.GetByID(toyId);

            if (toy == null)
            {
                return NotFound();
            }

            if (mediaUrls.IsNullOrEmpty())
            {
                return BadRequest(new { Message = "No media were uploaded" });
            }
            
            var imageUrls = await _fireBaseService.UploadImagesAsync(mediaUrls);

            var media = imageUrls.Select(mediaUrl => new Media
            {
                MediaUrl = mediaUrl,
                Status = "Active",
                ToyId = toyId
            }).ToList();

            _unitOfWork.MediaRepository.InsertList(media);
            _unitOfWork.Save();

            var mediaResponses = media.Select(media => new MediaResponse
            {
                Id = media.Id,
                MediaUrl = media.MediaUrl,
                Status = media.Status,
                ToyId = media.ToyId
            }).ToList();

            return Ok(mediaResponses);
        }

        //GET: api/Media/toy/5
        [HttpGet("toy/{toyId}")]
        [EnableQuery]
        public ActionResult<IEnumerable<MediaResponse>> GetMediaByToyId(int toyId, int pageIndex = 1, int pageSize = 20)
        {
            var mediaResponses = _unitOfWork.MediaRepository.Get(
                media => media.ToyId == toyId,
                includeProperties: "Toy",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(media => media.Id)
                .Select(media => new MediaResponse
                {
                    Id = media.Id,
                    MediaUrl = media.MediaUrl,
                    Status = media.Status,
                    ToyId = media.ToyId,
                });

            return Ok(mediaResponses);
        }

        [HttpPut("update-toy-media/{toyId}")]
        [EnableQuery]
        public async Task<IActionResult> UpdateToyMedia([FromForm] List<IFormFile> mediaUrls, int toyId)
        {
            var toy = _unitOfWork.ToyRepository.GetByID(toyId);

            if (toy == null)
            {
                return NotFound();
            }

            if (mediaUrls.IsNullOrEmpty())
            {
                return BadRequest(new { Message = "No image was uploaded" });
            }

            var oldMedia = _unitOfWork.MediaRepository.Get(
                media => media.ToyId == toyId,
                includeProperties: "Toy").ToList();

            if (oldMedia.IsNullOrEmpty())
            {
                return NotFound(new { Message = "This toy have no media" });
            }

            var oldMediaUrls = oldMedia.Select(media => media.MediaUrl).ToList();

            await _fireBaseService.DeleteImagesAsync(oldMediaUrls);

            _unitOfWork.MediaRepository.DeleteList(oldMedia);

            var imageUrls = await _fireBaseService.UploadImagesAsync(mediaUrls);

            var newMedia = imageUrls.Select(mediaUrl => new Media
            {
                MediaUrl = mediaUrl,
                Status = "Active",
                ToyId = toyId,
                Toy = _unitOfWork.ToyRepository.GetByID(toyId),
            }).ToList();

            _unitOfWork.MediaRepository.InsertList(newMedia);
            _unitOfWork.Save();

            var mediaResponses = newMedia.Select(media => new MediaResponse
            {
                Id = media.Id,
                MediaUrl = media.MediaUrl,
                Status = media.Status,
                ToyId = media.ToyId
            }).ToList();

            return Ok(mediaResponses);
        }

        [HttpPatch("update-toy-media-status/{toyId}")]
        [EnableQuery]
        public ActionResult UpdateToyMediaStatus(int toyId, string newStatus)
        {
            var toy = _unitOfWork.ToyRepository.GetByID(toyId);

            if (toy == null)
            {
                return NotFound();
            }

            var validStatuses = new List<string> { "Active", "Inactive", "Awaiting" };
            if (!validStatuses.Contains(newStatus))
            {
                return BadRequest(new { Message = "Invalid status value" });
            }

            var listMedia = _unitOfWork.MediaRepository.Get(
                media => media.ToyId == toyId,
                includeProperties: "Toy").ToList();

            if (listMedia.IsNullOrEmpty())
            {
                return NotFound(new { Message = "This toy have no media" });
            }

            foreach (var media in listMedia)
            {
                media.Status = newStatus;
            }

            _unitOfWork.MediaRepository.UpdateList(listMedia);
            _unitOfWork.Save();

            return Ok();
        }

        [HttpDelete("delete-toy-media-by-status/{toyId}")]
        [EnableQuery]
        public async Task<IActionResult> DeleteCheckingToyMedia(int toyId, string status)
        {
            var toy = _unitOfWork.ToyRepository.GetByID(toyId);

            if (toy == null)
            {
                return NotFound();
            }

            var validStatuses = new List<string> { "Active", "Inactive", "Awaiting" };
            if (!validStatuses.Contains(status))
            {
                return BadRequest(new { Message = "Invalid status value" });
            }

            var listMedia = _unitOfWork.MediaRepository.Get(
                media => media.ToyId == toyId && media.Status == status,
                includeProperties: "Toy").ToList();

            if (listMedia.IsNullOrEmpty())
            {
                return NotFound(new { Message = "This toy have no media" });
            }

            var listMediaUrls = listMedia.Select(media => media.MediaUrl).ToList();

            await _fireBaseService.DeleteImagesAsync(listMediaUrls);

            _unitOfWork.MediaRepository.DeleteList(listMedia);
            _unitOfWork.Save();

            return Ok();
        }

        [HttpDelete("delete-toy-media/{toyId}")]
        [EnableQuery]
        public async Task<IActionResult> DeleteToyMedia(int toyId)
        {
            var toy = _unitOfWork.ToyRepository.GetByID(toyId);

            if (toy == null)
            {
                return NotFound();
            }

            var listMedia = _unitOfWork.MediaRepository.Get(
                media => media.ToyId == toyId,
                includeProperties: "Toy").ToList();

            if (listMedia.IsNullOrEmpty())
            {
                return NotFound(new { Message = "This toy have no media" });
            }

            var listMediaUrls = listMedia.Select(media => media.MediaUrl).ToList();

            await _fireBaseService.DeleteImagesAsync(listMediaUrls);

            _unitOfWork.MediaRepository.DeleteList(listMedia);
            _unitOfWork.Save();

            return Ok();
        } 
    }    
}
