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
using Microsoft.AspNetCore.OData.Query;
using System.Drawing.Printing;
using EduToyRentRepositories.DTO.Request;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using NuGet.Protocol.Plugins;

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ToysController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public ToysController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/Toy
        [HttpGet]
        [EnableQuery]
        public ActionResult<IEnumerable<ToyResponse>> GetToys(int pageIndex = 1, int pageSize = 20)
        {
            var toys = _unitOfWork.ToyRepository.Get(
                includeProperties: "Category,User,User.Role",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(toy => toy.Id)
                .Select(toy => new ToyResponse
                {
                    Id = toy.Id,
                    Name = toy.Name,
                    Description = toy.Description,
                    Price = toy.Price,
                    Origin = toy.Origin,
                    Age = toy.Age,
                    Brand = toy.Brand,
                    Star = (float?)toy.Star,
                    RentCount = toy.RentCount,
                    BuyQuantity = toy.BuyQuantity,
                    CreateDate = toy.CreateDate,
                    RentTime = toy.RentTime,
                    Status = toy.Status,
                    Owner = new UserResponse
                    {
                        Id = toy.UserId,
                        FullName = toy.User.FullName,
                        Email = toy.User.Email,
                        CreateDate = toy.User.CreateDate,
                        Phone = toy.User.Phone,
                        Dob = toy.User.Dob,
                        Address = toy.User.Address,
                        AvatarUrl = toy.User.AvatarUrl,
                        Status = toy.User.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.User.Role.Id,
                            Name = toy.User.Role.Name
                        }
                    },
                    Category = new CategoryResponse
                    {
                        Id = toy.Category.Id,
                        Name = toy.Category.Name
                    },
                    Approver = _unitOfWork.UserRepository.GetByID(toy.ApproverId) != null ? new UserResponse
                    {
                        Id = (int)toy.ApproverId,
                        FullName = toy.Approver.FullName,
                        Email = toy.Approver.Email,
                        CreateDate = toy.Approver.CreateDate,
                        Phone = toy.Approver.Phone,
                        Dob = toy.Approver.Dob,
                        Address = toy.Approver.Address,
                        AvatarUrl = toy.Approver.AvatarUrl,
                        Status = toy.Approver.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.Approver.Role.Id,
                            Name = toy.Approver.Role.Name
                        }
                    } : null
                }).ToList();

            return Ok(toys);
        }
        // GET: api/Toy/active
        [HttpGet("active")]
        [EnableQuery]
        public ActionResult<IEnumerable<ToyResponse>> GetActiveToys(int pageIndex = 1, int pageSize = 20)
        {
            var toys = _unitOfWork.ToyRepository.Get(
                includeProperties: "Category,User,User.Role",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Where(toy => toy.Status == "Active") 
                .OrderByDescending(toy => toy.Id)
                .Select(toy => new ToyResponse
                {
                    Id = toy.Id,
                    Name = toy.Name,
                    Description = toy.Description,
                    Price = toy.Price,
                    Origin = toy.Origin,
                    Age = toy.Age,
                    Brand = toy.Brand,
                    Star = (float?)toy.Star,
                    RentCount = toy.RentCount,
                    BuyQuantity = toy.BuyQuantity,
                    CreateDate = toy.CreateDate,
                    RentTime = toy.RentTime,
                    Status = toy.Status,
                    Owner = new UserResponse
                    {
                        Id = toy.UserId,
                        FullName = toy.User.FullName,
                        Email = toy.User.Email,
                        CreateDate = toy.User.CreateDate,
                        Phone = toy.User.Phone,
                        Dob = toy.User.Dob,
                        Address = toy.User.Address,
                        AvatarUrl = toy.User.AvatarUrl,
                        Status = toy.User.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.User.Role.Id,
                            Name = toy.User.Role.Name
                        }
                    },
                    Category = new CategoryResponse
                    {
                        Id = toy.Category.Id,
                        Name = toy.Category.Name
                    },
                    Approver = _unitOfWork.UserRepository.GetByID(toy.ApproverId) != null ? new UserResponse
                    {
                        Id = (int)toy.ApproverId,
                        FullName = toy.Approver.FullName,
                        Email = toy.Approver.Email,
                        CreateDate = toy.Approver.CreateDate,
                        Phone = toy.Approver.Phone,
                        Dob = toy.Approver.Dob,
                        Address = toy.Approver.Address,
                        AvatarUrl = toy.Approver.AvatarUrl,
                        Status = toy.Approver.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.Approver.Role.Id,
                            Name = toy.Approver.Role.Name
                        }
                    } : null
                }).ToList();

            return Ok(toys);
        }

        // GET: api/Toy/5
        [HttpGet("{id}")]
        [EnableQuery]
        public async Task<ActionResult<ToyResponse>> GetToy(int id)
        {

            var toy = _unitOfWork.ToyRepository.GetByID(id);

            if (toy == null)
            {
                return NotFound();
            }
            var category = _unitOfWork.CategoryRepository.GetByID(toy.CategoryId);
            var user = _unitOfWork.UserRepository.GetByID(toy.UserId);
            var userRole = _unitOfWork.RoleRepository.GetByID(user.RoleId);
            var approver = _unitOfWork.UserRepository.GetByID(toy.ApproverId);
            var approverRole = _unitOfWork.RoleRepository.GetByID(approver.RoleId);
            var toyResponse = new ToyResponse
            {
                Id = toy.Id,
                Name = toy.Name,
                Description = toy.Description,
                Price = toy.Price,
                Origin = toy.Origin,
                Age = toy.Age,
                Brand = toy.Brand,
                Star = (float?)toy.Star,
                RentCount = toy.RentCount,
                BuyQuantity = toy.BuyQuantity,
                CreateDate = toy.CreateDate,
                RentTime = toy.RentTime,
                Status = toy.Status,
                Owner = new UserResponse
                {
                    Id = toy.UserId,
                    FullName = user.FullName,
                    Email = user.Email,
                    CreateDate = user.CreateDate,
                    Phone = user.Phone,
                    Dob = user.Dob,
                    Address = user.Address,
                    AvatarUrl = user.AvatarUrl,
                    Status = user.Status,
                    Role = new RoleResponse
                    {
                        Id = userRole.Id,
                        Name = userRole.Name
                    }
                },
                Category = new CategoryResponse
                {
                    Id = category.Id,
                    Name = category.Name
                },
                Approver = _unitOfWork.UserRepository.GetByID(toy.ApproverId) != null ? new UserResponse
                {
                    Id = (int)toy.ApproverId,
                    FullName = approver.FullName,
                    Email = approver.Email,
                    CreateDate = approver.CreateDate,
                    Phone = approver.Phone,
                    Dob = approver.Dob,
                    Address = approver.Address,
                    AvatarUrl = approver.AvatarUrl,
                    Status = approver.Status,
                    Role = new RoleResponse
                    {
                        Id = approverRole.Id,
                        Name = approverRole.Name
                    }
                } : null
            };

            return Ok(toyResponse);
        }
        // POST: api/Toys
        [HttpPost]
        [EnableQuery]
        public async Task<ActionResult<ToyResponse>> PostToy(ToyRequest toyRequest)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized();
            }
            var userId = int.Parse(userIdClaim.Value);
            var userRole = _unitOfWork.UserRepository.GetByID(userId).RoleId;

            int buyQuantity = 0;

            if (userRole == 2)
            {
                buyQuantity = 0; 
            }
            else if (userRole == 3) 
            {
                buyQuantity = (int)toyRequest.BuyQuantity;
            }
            var toy = new Toy
            {
                Name = toyRequest.Name,
                Description = toyRequest.Description,
                Price = toyRequest.Price,
                Origin = toyRequest.Origin,
                Age = toyRequest.Age,
                RentCount = 0,
                BuyQuantity = buyQuantity,
                RentTime = "0 Week",
                Brand = toyRequest.Brand,
                CategoryId = toyRequest.CategoryId,
                Status = "Inactive",
                UserId = userId,
                ApproverId = null,
                CreateDate = DateTime.Now
            };

            _unitOfWork.ToyRepository.Insert(toy);
            _unitOfWork.Save();

            var toyResponse = new ToyResponse
            {
                Id = toy.Id,
                Name = toy.Name,
                Description = toy.Description,
                Price = toy.Price,
                Origin = toy.Origin,
                Age = toy.Age,
                Brand = toy.Brand,
                RentCount = toy.RentCount,
                BuyQuantity = toy.BuyQuantity,
                CreateDate = toy.CreateDate,
                RentTime = toy.RentTime,
                Status = toy.Status,
                Owner = new UserResponse
                {
                    Id = toy.UserId,
                    FullName = _unitOfWork.UserRepository.GetByID(userId).FullName,
                    Email = _unitOfWork.UserRepository.GetByID(userId).Email
                },
                Category = new CategoryResponse
                {
                    Id = toy.CategoryId,
                    Name = _unitOfWork.CategoryRepository.GetByID(toy.CategoryId).Name
                }
            };

            return CreatedAtAction("GetToy", new { id = toy.Id }, toyResponse);
        }
        [HttpPut("{id}")]
        [EnableQuery]
        [Authorize]
        public async Task<IActionResult> PutToy(int id, ToyRequest toyRequest)
        {
            var toy = _unitOfWork.ToyRepository.GetByID(id);

            if (toy == null)
            {
                return NotFound();
            }

            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized();
            }
            var userId = int.Parse(userIdClaim.Value);
            var userRole = _unitOfWork.UserRepository.GetByID(userId).RoleId;

            int buyQuantity = 0;

            if (userRole == 2)
            {
                buyQuantity = 0;
            }
            else if (userRole == 3)
            {
                buyQuantity = (int)toyRequest.BuyQuantity;
            }
            toy.Name = toyRequest.Name;
            toy.Description = toyRequest.Description;
            toy.Price = toyRequest.Price;
            toy.Origin = toyRequest.Origin;
            toy.BuyQuantity = buyQuantity;
            toy.Age = toyRequest.Age;
            toy.Brand = toyRequest.Brand;
            toy.CategoryId = toyRequest.CategoryId;
            toy.Status = "Inactive";
            toy.CreateDate = DateTime.Now;

            _unitOfWork.ToyRepository.Update(toy);

            try
            {
                _unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_unitOfWork.ToyRepository.Get().Any(t => t.Id == id))
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

        [HttpPatch("{id}/update-status")]
        public ActionResult UpdateToyStatus(int id, [FromBody] string newStatus)
        {
            var toy = _unitOfWork.ToyRepository.GetByID(id);
            if (toy == null)
            {
                return NotFound(new { Message = "Toy not found." });
            }

            var validStatuses = new List<string> { "Active", "Inactive", "Pending", "Sold", "Banned" }; 
            if (!validStatuses.Contains(newStatus))
            {
                return BadRequest(new { Message = "Invalid status value." });
            }

            toy.Status = newStatus;
            _unitOfWork.ToyRepository.Update(toy);
            _unitOfWork.Save();

            return Ok(new { Message = "Toy status updated successfully.", Toy = toy });
        }

        // GET: api/Toy/category/{categoryId}
        [HttpGet("category/{categoryId}")]
        public ActionResult<IEnumerable<ToyResponse>> GetToysByCategory(int categoryId, int pageIndex = 1, int pageSize = 20)
        {
            var toys = _unitOfWork.ToyRepository.Get(
                toy => toy.CategoryId == categoryId,
                includeProperties: "Category,User,User.Role",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(toy => toy.Id)
                .Where(toy => toy.Status == "Active")
                .Select(toy => new ToyResponse
                {
                    Id = toy.Id,
                    Name = toy.Name,
                    Description = toy.Description,
                    Price = toy.Price,
                    Origin = toy.Origin,
                    Age = toy.Age,
                    Brand = toy.Brand,
                    Star = (float?)toy.Star,
                    RentCount = toy.RentCount,
                    BuyQuantity = toy.BuyQuantity,
                    CreateDate = toy.CreateDate,
                    RentTime = toy.RentTime,
                    Status = toy.Status,
                    Owner = new UserResponse
                    {
                        Id = toy.UserId,
                        FullName = toy.User.FullName,
                        Email = toy.User.Email,
                        CreateDate = toy.User.CreateDate,
                        Phone = toy.User.Phone,
                        Dob = toy.User.Dob,
                        Address = toy.User.Address,
                        AvatarUrl = toy.User.AvatarUrl,
                        Status = toy.User.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.User.Role.Id,
                            Name = toy.User.Role.Name
                        }
                    },
                    Category = new CategoryResponse
                    {
                        Id = toy.Category.Id,
                        Name = toy.Category.Name
                    },
                    Approver = _unitOfWork.UserRepository.GetByID(toy.ApproverId) != null ? new UserResponse
                    {
                        Id = (int)toy.ApproverId,
                        FullName = toy.Approver.FullName,
                        Email = toy.Approver.Email,
                        CreateDate = toy.Approver.CreateDate,
                        Phone = toy.Approver.Phone,
                        Dob = toy.Approver.Dob,
                        Address = toy.Approver.Address,
                        AvatarUrl = toy.Approver.AvatarUrl,
                        Status = toy.Approver.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.Approver.Role.Id,
                            Name = toy.Approver.Role.Name
                        }
                    } : null
                }).ToList();

            return Ok(toys);
        }
        // GET: api/Toy/age/{ageRange}
        [HttpGet("age/{ageRange}")]
        public ActionResult<IEnumerable<ToyResponse>> GetToysByAge(string ageRange, int pageIndex = 1, int pageSize = 20)
        {
            var toys = _unitOfWork.ToyRepository.Get(includeProperties: "Category,User,User.Role", pageIndex: pageIndex, pageSize: pageSize)
                .Where(toy =>
                {
                    switch (ageRange.ToLower())
                    {
                        case "0-3":
                            return toy.Age == "0-3";
                        case "3-5":
                            return toy.Age == "3-5";
                        case "6-11":
                            return toy.Age == "6-11";
                        case "12+":
                            return toy.Age == "12+";
                        default:
                            return false; 
                    }
                })
                .OrderByDescending(toy => toy.Id)
                .Where(toy => toy.Status == "Active")
                .Select(toy => new ToyResponse
                {
                    Id = toy.Id,
                    Name = toy.Name,
                    Description = toy.Description,
                    Price = toy.Price,
                    Origin = toy.Origin,
                    Age = toy.Age,
                    Brand = toy.Brand,
                    Star = (float?)toy.Star,
                    RentCount = toy.RentCount,
                    BuyQuantity = toy.BuyQuantity,
                    CreateDate = toy.CreateDate,
                    RentTime = toy.RentTime,
                    Status = toy.Status,
                    Owner = new UserResponse
                    {
                        Id = toy.UserId,
                        FullName = toy.User.FullName,
                        Email = toy.User.Email,
                        CreateDate = toy.User.CreateDate,
                        Phone = toy.User.Phone,
                        Dob = toy.User.Dob,
                        Address = toy.User.Address,
                        AvatarUrl = toy.User.AvatarUrl,
                        Status = toy.User.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.User.Role.Id,
                            Name = toy.User.Role.Name
                        }
                    },
                    Category = new CategoryResponse
                    {
                        Id = toy.Category.Id,
                        Name = toy.Category.Name
                    },
                    Approver = _unitOfWork.UserRepository.GetByID(toy.ApproverId) != null ? new UserResponse
                    {
                        Id = (int)toy.ApproverId,
                        FullName = toy.Approver.FullName,
                        Email = toy.Approver.Email,
                        CreateDate = toy.Approver.CreateDate,
                        Phone = toy.Approver.Phone,
                        Dob = toy.Approver.Dob,
                        Address = toy.Approver.Address,
                        AvatarUrl = toy.Approver.AvatarUrl,
                        Status = toy.Approver.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.Approver.Role.Id,
                            Name = toy.Approver.Role.Name
                        }
                    } : null
                }).ToList();

            return Ok(toys);
        }
        //search
        [HttpGet("search")]
        public ActionResult<IEnumerable<ToyResponse>> SearchToysByName(string name, int pageIndex = 1, int pageSize = 20)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest(new { Message = "Search term cannot be empty." });
            }

            var toys = _unitOfWork.ToyRepository.Get(
                includeProperties: "Category,User,User.Role",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Where(toy => toy.Name.Contains(name, StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(toy => toy.Id)
                .Select(toy => new ToyResponse
                {
                    Id = toy.Id,
                    Name = toy.Name,
                    Description = toy.Description,
                    Price = toy.Price,
                    Origin = toy.Origin,
                    Age = toy.Age,
                    Brand = toy.Brand,
                    Star = (float?)toy.Star,
                    RentCount = toy.RentCount,
                    BuyQuantity = toy.BuyQuantity,
                    CreateDate = toy.CreateDate,
                    RentTime = toy.RentTime,
                    Status = toy.Status,
                    Owner = new UserResponse
                    {
                        Id = toy.UserId,
                        FullName = toy.User.FullName,
                        Email = toy.User.Email,
                        CreateDate = toy.User.CreateDate,
                        Phone = toy.User.Phone,
                        Dob = toy.User.Dob,
                        Address = toy.User.Address,
                        AvatarUrl = toy.User.AvatarUrl,
                        Status = toy.User.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.User.Role.Id,
                            Name = toy.User.Role.Name
                        }
                    },
                    Category = new CategoryResponse
                    {
                        Id = toy.Category.Id,
                        Name = toy.Category.Name
                    },
                    Approver = _unitOfWork.UserRepository.GetByID(toy.ApproverId) != null ? new UserResponse
                    {
                        Id = (int)toy.ApproverId,
                        FullName = toy.Approver.FullName,
                        Email = toy.Approver.Email,
                        CreateDate = toy.Approver.CreateDate,
                        Phone = toy.Approver.Phone,
                        Dob = toy.Approver.Dob,
                        Address = toy.Approver.Address,
                        AvatarUrl = toy.Approver.AvatarUrl,
                        Status = toy.Approver.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.Approver.Role.Id,
                            Name = toy.Approver.Role.Name
                        }
                    } : null
                }).ToList();

            if (!toys.Any())
            {
                return NotFound(new { Message = "No toys found matching the search criteria." });
            }

            return Ok(toys);
        }
        // GET: api/Toy/user/{userId}
        [HttpGet("user/{OwnerId}")]
        public ActionResult<IEnumerable<ToyResponse>> GetToysByOwnerId(int OwnerId, int pageIndex = 1, int pageSize = 20)
        {
            var toys = _unitOfWork.ToyRepository.Get(
                toy => toy.UserId == OwnerId,
                includeProperties: "Category,User,User.Role",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(toy => toy.Id)
                .Select(toy => new ToyResponse
                {
                    Id = toy.Id,
                    Name = toy.Name,
                    Description = toy.Description,
                    Price = toy.Price,
                    Origin = toy.Origin,
                    Age = toy.Age,
                    Brand = toy.Brand,
                    Star = (float?)toy.Star,
                    RentCount = toy.RentCount,
                    BuyQuantity = toy.BuyQuantity,
                    CreateDate = toy.CreateDate,
                    RentTime = toy.RentTime,
                    Status = toy.Status,
                    Owner = new UserResponse
                    {
                        Id = toy.UserId,
                        FullName = toy.User.FullName,
                        Email = toy.User.Email,
                        CreateDate = toy.User.CreateDate,
                        Phone = toy.User.Phone,
                        Dob = toy.User.Dob,
                        Address = toy.User.Address,
                        AvatarUrl = toy.User.AvatarUrl,
                        Status = toy.User.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.User.Role.Id,
                            Name = toy.User.Role.Name
                        }
                    },
                    Category = new CategoryResponse
                    {
                        Id = toy.Category.Id,
                        Name = toy.Category.Name
                    },
                    Approver = _unitOfWork.UserRepository.GetByID(toy.ApproverId) != null ? new UserResponse
                    {
                        Id = (int)toy.ApproverId,
                        FullName = toy.Approver.FullName,
                        Email = toy.Approver.Email,
                        CreateDate = toy.Approver.CreateDate,
                        Phone = toy.Approver.Phone,
                        Dob = toy.Approver.Dob,
                        Address = toy.Approver.Address,
                        AvatarUrl = toy.Approver.AvatarUrl,
                        Status = toy.Approver.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.Approver.Role.Id,
                            Name = toy.Approver.Role.Name
                        }
                    } : null
                }).ToList();

            return Ok(toys);
        }
        // GET: api/Toys/AvailableForPurchase
        [HttpGet("AvailableForPurchase")]
        [EnableQuery]
        public ActionResult<IEnumerable<ToyResponse>> GetToysAvailableForPurchase(int pageIndex = 1, int pageSize = 20)
        {
            var toys = _unitOfWork.ToyRepository.Get(
                filter: t => t.BuyQuantity > -1,
                includeProperties: "Category,User,User.Role",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Where(toy => toy.Status == "Active")
                .OrderByDescending(toy => toy.Id)
                .Select(toy => new ToyResponse
                {
                    Id = toy.Id,
                    Name = toy.Name,
                    Description = toy.Description,
                    Price = toy.Price,
                    Origin = toy.Origin,
                    Age = toy.Age,
                    Brand = toy.Brand,
                    Star = (float?)toy.Star,
                    RentCount = toy.RentCount,
                    BuyQuantity = toy.BuyQuantity,
                    CreateDate = toy.CreateDate,
                    RentTime = toy.RentTime,
                    Status = toy.Status,
                    Owner = new UserResponse
                    {
                        Id = toy.UserId,
                        FullName = toy.User.FullName,
                        Email = toy.User.Email,
                        CreateDate = toy.User.CreateDate,
                        Phone = toy.User.Phone,
                        Dob = toy.User.Dob,
                        Address = toy.User.Address,
                        AvatarUrl = toy.User.AvatarUrl,
                        Status = toy.User.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.User.Role.Id,
                            Name = toy.User.Role.Name
                        }
                    },
                    Category = new CategoryResponse
                    {
                        Id = toy.Category.Id,
                        Name = toy.Category.Name
                    },
                    Approver = _unitOfWork.UserRepository.GetByID(toy.ApproverId) != null ? new UserResponse
                    {
                        Id = (int)toy.ApproverId,
                        FullName = toy.Approver.FullName,
                        Email = toy.Approver.Email,
                        CreateDate = toy.Approver.CreateDate,
                        Phone = toy.Approver.Phone,
                        Dob = toy.Approver.Dob,
                        Address = toy.Approver.Address,
                        AvatarUrl = toy.Approver.AvatarUrl,
                        Status = toy.Approver.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.Approver.Role.Id,
                            Name = toy.Approver.Role.Name
                        }
                    } : null
                })
                .ToList();

            return Ok(toys);
        }
        // GET: api/Toys/AvailableForRent
        [HttpGet("AvailableForRent")]
        [EnableQuery]
        public ActionResult<IEnumerable<ToyResponse>> GetToysAvailableForRent(int pageIndex = 1, int pageSize = 20)
        {
            var toys = _unitOfWork.ToyRepository.Get( 
                filter: t => t.RentCount > -1,
                includeProperties: "Category,User,User.Role",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Where(toy => toy.Status == "Active")
                .OrderByDescending(toy => toy.Id)
                .Select(toy => new ToyResponse
                {
                    Id = toy.Id,
                    Name = toy.Name,
                    Description = toy.Description,
                    Price = toy.Price,
                    Origin = toy.Origin,
                    Age = toy.Age,
                    Brand = toy.Brand,
                    Star = (float?)toy.Star,
                    RentCount = toy.RentCount,
                    BuyQuantity = toy.BuyQuantity,
                    CreateDate = toy.CreateDate,
                    RentTime = toy.RentTime,
                    Status = toy.Status,
                    Owner = new UserResponse
                    {
                        Id = toy.UserId,
                        FullName = toy.User.FullName,
                        Email = toy.User.Email,
                        CreateDate = toy.User.CreateDate,
                        Phone = toy.User.Phone,
                        Dob = toy.User.Dob,
                        Address = toy.User.Address,
                        AvatarUrl = toy.User.AvatarUrl,
                        Status = toy.User.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.User.Role.Id,
                            Name = toy.User.Role.Name
                        }
                    },
                    Category = new CategoryResponse
                    {
                        Id = toy.Category.Id,
                        Name = toy.Category.Name
                    },
                    Approver = _unitOfWork.UserRepository.GetByID(toy.ApproverId) != null ? new UserResponse
                    {
                        Id = (int)toy.ApproverId,
                        FullName = toy.Approver.FullName,
                        Email = toy.Approver.Email,
                        CreateDate = toy.Approver.CreateDate,
                        Phone = toy.Approver.Phone,
                        Dob = toy.Approver.Dob,
                        Address = toy.Approver.Address,
                        AvatarUrl = toy.Approver.AvatarUrl,
                        Status = toy.Approver.Status,
                        Role = new RoleResponse
                        {
                            Id = toy.Approver.Role.Id,
                            Name = toy.Approver.Role.Name
                        }
                    } : null
                })
                .ToList();

            return Ok(toys);
        }

    }
}
