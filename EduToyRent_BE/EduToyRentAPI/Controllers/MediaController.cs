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

        //// PUT: api/Media/5
        //// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //[HttpPut("{id}")]
        //public async Task<IActionResult> PutMedia(int id, [FromForm] MediaRequest mediaRequest)
        //{
        //    var media = _unitOfWork.MediaRepository.GetByID(id);

        //    if (media == null)
        //    {
        //        return NotFound();
        //    }

        //    if (mediaRequest.MediaUrl != null)
        //    {
        //        media.MediaUrl = await _fireBaseService.UploadImageAsync(mediaRequest.MediaUrl);
        //    }

        //    media.Status = mediaRequest.Status;
        //    media.ToyId = mediaRequest.ToyId;

        //    try
        //    {
        //        await _context.SaveChangesAsync();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!MediaExists(id))
        //        {
        //            return NotFound();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return NoContent();
        //}

        //// POST: api/Media
        //// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //[HttpPost]
        //public async Task<ActionResult<Media>> PostMedia(Media media)
        //{
        //    _context.Media.Add(media);
        //    await _context.SaveChangesAsync();

        //    return CreatedAtAction("GetMedia", new { id = media.Id }, media);
        //}

        //// DELETE: api/Media/5
        //[HttpDelete("{id}")]
        //public async Task<IActionResult> DeleteMedia(int id)
        //{
        //    var media = await _context.Media.FindAsync(id);
        //    if (media == null)
        //    {
        //        return NotFound();
        //    }

        //    _context.Media.Remove(media);
        //    await _context.SaveChangesAsync();

        //    return NoContent();
        //}

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
                Status = "Inactive",
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
                Status = "Inactive",
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
        public ActionResult UpdateToyMediaStatus(int toyId, [FromBody] string newStatus)
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
        public async Task<IActionResult> DeleteCheckingToyMedia(int toyId, [FromBody] string status)
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
