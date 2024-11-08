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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OData.Query;

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public CategoriesController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/Categories
        [HttpGet]
        [EnableQuery]
        public ActionResult<IEnumerable<CategoryResponse>> GetCategories(int pageIndex = 1, int pageSize = 50)
        {
            var categories = _unitOfWork.CategoryRepository.Get(pageIndex: pageIndex, pageSize: pageSize)
                .Select(category => new CategoryResponse
                {
                    Id = category.Id,
                    Name = category.Name,
                    Description = category.Description,
                    Status = category.Status
                }).ToList();

            return Ok(categories);
        }

        // GET: api/Categories/5
        [HttpGet("{id}")]
        [EnableQuery]
        public async Task<ActionResult<CategoryResponse>> GetCategory(int id)
        {
            var category = _unitOfWork.CategoryRepository.GetByID(id);

            if (category == null)
            {
                return NotFound();
            }

            var categoryResponse = new CategoryResponse
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Status = category.Status
            };

            return Ok(categoryResponse);
        }

        // PUT: api/Categories/5
        [HttpPut("{id}")]
        [EnableQuery]
        public async Task<IActionResult> PutCategory(int id, CategoryRequest categoryRequest)
        {
            var category = _unitOfWork.CategoryRepository.GetByID(id);

            if (category == null)
            {
                return NotFound();
            }

            category.Name = categoryRequest.Name;
            category.Description = categoryRequest.Description;
            category.Status = categoryRequest.Status;

            _unitOfWork.CategoryRepository.Update(category);

            try
            {
                _unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
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

        // POST: api/Categories
        [HttpPost]
        [EnableQuery]
        public async Task<ActionResult<CategoryResponse>> PostCategory(CategoryRequest categoryRequest)
        {
            var category = new Category
            {
                Name = categoryRequest.Name,
                Description = categoryRequest.Description,
                Status = categoryRequest.Status
            };

            _unitOfWork.CategoryRepository.Insert(category);
            _unitOfWork.Save();

            var categoryResponse = new CategoryResponse
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Status = category.Status
            };

            return CreatedAtAction("GetCategory", new { id = category.Id }, categoryResponse);
        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}")]
        [EnableQuery]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = _unitOfWork.CategoryRepository.GetByID(id);
            if (category == null)
            {
                return NotFound();
            }

            _unitOfWork.CategoryRepository.Delete(category);
            _unitOfWork.Save();

            return NoContent();
        }

        private bool CategoryExists(int id)
        {
            return _unitOfWork.CategoryRepository.Get().Any(e => e.Id == id);
        }
    }
}
