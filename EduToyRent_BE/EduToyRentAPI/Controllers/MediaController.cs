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
        public ActionResult<IEnumerable<MediaResponse>> GetMedias(int pageIndex = 1, int pageSize = 20)
        {
            var medias = _unitOfWork.MediaRepository.Get(
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
             
            return Ok(medias);
        }

        // GET: api/Media/5
        [HttpGet("{id}")]
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

        //private bool MediaExists(int id)
        //{
        //    return _context.Media.Any(e => e.Id == id);
        //}
    }
}
