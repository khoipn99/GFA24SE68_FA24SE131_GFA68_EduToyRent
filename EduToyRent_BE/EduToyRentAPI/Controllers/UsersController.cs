﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduToyRentRepositories.Models;
using Microsoft.AspNetCore.OData.Query;
using EduToyRentRepositories.Interface;
using Microsoft.AspNetCore.Authorization;
using EduToyRentRepositories.DTO.Response;
using EduToyRentRepositories.DTO.Request;
using EduToyRentAPI.FireBaseService;

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        private readonly IFireBaseService _fireBaseService;

        public UsersController(IUnitOfWork unitOfWork, IFireBaseService fireBaseService)
        {
            _unitOfWork = unitOfWork;
            _fireBaseService = fireBaseService;
        }

        // GET: api/Users
        [HttpGet]
        [EnableQuery]
        public ActionResult<IEnumerable<UserResponse>> GetUsers(int pageIndex = 1, int pageSize = 50)
        {
            var users = _unitOfWork.UserRepository.Get(
                includeProperties: "Role",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Select(user => new UserResponse
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Password = user.Password,
                    CreateDate = user.CreateDate,
                    Phone = user.Phone,
                    Dob = user.Dob ?? DateTime.MinValue,
                    Address = user.Address,
                    AvatarUrl = user.AvatarUrl,
                    Description = user.Description,
                    Star = user.Star,
                    WalletId = (int?)user.WalletId,
                    Status = user.Status,
                    Role = new RoleResponse
                    {
                        Id = user.Role.Id,
                        Name = user.Role.Name
                    }
                }).ToList();

            return Ok(users);
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        [EnableQuery]
       // [Authorize(Roles = "1")]
        public async Task<ActionResult<UserResponse>> GetUser(int id)
        {
            var user = _unitOfWork.UserRepository.GetByID(id);

            if (user == null)
            {
                return NotFound();
            }

            var userResponse = new UserResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Password = user.Password,
                CreateDate = user.CreateDate,
                Phone = user.Phone,
                Dob = user.Dob ?? DateTime.MinValue,
                Address = user.Address,
                AvatarUrl = user.AvatarUrl,
                Description = user.Description,
                Star = user.Star,
                WalletId = (int?)user.WalletId,
                Status = user.Status,
                Role = new RoleResponse
                {
                    Id = user.RoleId,
                    Name = _unitOfWork.RoleRepository.GetByID(user.RoleId).Name
                }
            };

            return Ok(userResponse);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        [EnableQuery]
     //   [Authorize(Roles = "1")]
        public async Task<IActionResult> PutUser(int id, UserRequest userRequest)
        {
            var user = _unitOfWork.UserRepository.GetByID(id);

            if (user == null)
            {
                return NotFound();
            }

            user.FullName = userRequest.FullName;
            user.Email = userRequest.Email;
            user.Password = userRequest.Password;
            user.Phone = userRequest.Phone;
            user.Dob = userRequest.Dob;
            user.Address = userRequest.Address;
            user.Status = userRequest.Status;
            user.WalletId = userRequest.WalletId;
            user.Description = userRequest.Description;
            _unitOfWork.UserRepository.Update(user);

            try
            {
                _unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
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

        // POST: api/Users
        [HttpPost]
        [EnableQuery]
        //[Authorize(Roles = "1")]
        public async Task<ActionResult<UserResponse>> PostUser([FromForm] UserRequest userRequest)
        {
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var vietnamTime = TimeZoneInfo.ConvertTime(DateTime.Now, vietnamTimeZone);

            var user = new User
            {
                FullName = userRequest.FullName,
                Email = userRequest.Email,
                Password = userRequest.Password,
                Phone = userRequest.Phone,
                Dob = userRequest.Dob,
                Address = userRequest.Address,
                //AvatarUrl = userRequest.AvatarUrl,
                Description = userRequest.Description,
                Status = userRequest.Status,
                CreateDate = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")),
                RoleId = userRequest.RoleId
            };

            if (userRequest.AvatarUrl != null)
            {
                user.AvatarUrl = await _fireBaseService.UploadImageAsync(userRequest.AvatarUrl);
            }

            _unitOfWork.UserRepository.Insert(user);
            _unitOfWork.Save();

            var userResponse = new UserResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Password = user.Password,
                CreateDate = user.CreateDate,
                Phone = user.Phone,
                Dob = user.Dob ?? DateTime.MinValue,
                Address = user.Address,
                AvatarUrl = user.AvatarUrl,
                Description = user.Description,
                Star = user.Star,
                Status = user.Status,
                Role = new RoleResponse
                {
                    Id = user.RoleId,
                    Name = _unitOfWork.RoleRepository.GetByID(user.RoleId).Name
                }
            };

            return CreatedAtAction("GetUser", new { id = user.Id }, userResponse);
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        [EnableQuery]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = _unitOfWork.UserRepository.GetByID(id);
            if (user == null)
            {
                return NotFound();
            }

            _unitOfWork.UserRepository.Delete(user);
            _unitOfWork.Save();

            return NoContent();
        }

        // GET: api/Users/ByEmail
        [HttpGet("ByEmail")]
        [EnableQuery]
       // [Authorize(Roles = "1,3")]
        public ActionResult<IEnumerable<UserResponse>> GetUserByEmail(string email, int pageIndex = 1, int pageSize = 5)
        {
            var users = _unitOfWork.UserRepository.Get(
                includeProperties: "Role",
                filter: u => u.Email.ToLower().Contains(email.ToLower()),
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Select(user => new UserResponse
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Password = user.Password,
                    CreateDate = user.CreateDate,
                    Phone = user.Phone,
                    Dob = user.Dob ?? DateTime.MinValue,
                    Address = user.Address,
                    AvatarUrl = user.AvatarUrl,
                    Description = user.Description,
                    Star = user.Star,
                    WalletId = (int?)user.WalletId,
                    Status = user.Status,
                    Role = new RoleResponse
                    {
                        Id = user.Role.Id,
                        Name = _unitOfWork.RoleRepository.GetByID(user.RoleId).Name
                    }
                }).ToList();

            return Ok(users);
        }

        //[HttpPut("upload-user-image/{userId}")]
        //[EnableQuery]
        ////[Authorize(Roles = "1")]
        //public async Task<IActionResult> UploadUserImage(IFormFile userImage, int userId)
        //{
        //    var user = _unitOfWork.UserRepository.GetByID(userId);

        //    if (user == null)
        //    {
        //        return NotFound();
        //    }

        //    if (userImage != null)
        //    {
        //        user.AvatarUrl = await _fireBaseService.UploadImageAsync(userImage);
        //    }

        //    _unitOfWork.UserRepository.Update(user);

        //    try
        //    {
        //        _unitOfWork.Save();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!UserExists(userId))
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

        [HttpPut("update-user-image/{userId}")]
        [EnableQuery]
        //[Authorize(Roles = "1")]
        public async Task<IActionResult> UpdateUserImage(IFormFile userImage, int userId)
        {
            var user = _unitOfWork.UserRepository.GetByID(userId);

            if (user == null)
            {
                return NotFound();
            }

            if (userImage == null)
            {
                return BadRequest();
            }

            if (user.AvatarUrl == null)
            {
                user.AvatarUrl = await _fireBaseService.UploadImageAsync(userImage);
            }
            else
            {
                await _fireBaseService.DeleteImageAsync(user.AvatarUrl);
                user.AvatarUrl = await _fireBaseService.UploadImageAsync(userImage);                
            }

            _unitOfWork.UserRepository.Update(user);

            try
            {
                _unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(userId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok();
        }
        // ban 
        [HttpPut("BanUser/{userId}")]
        public async Task<IActionResult> BanUser(int userId)
        {
            var user = _unitOfWork.UserRepository.GetByID(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var userToys = _unitOfWork.ToyRepository.GetV2(t => t.UserId == userId).ToList();
            var hasRentingOrAwaiting = userToys.Any(toy => toy.Status == "Renting" || toy.Status == "Awaiting");

            foreach (var toy in userToys)
            {
                if (toy.Status != "Renting" && toy.Status != "Awaiting")
                {
                    toy.Status = "Banned";
                    _unitOfWork.ToyRepository.Update(toy);
                }
            }

            if (hasRentingOrAwaiting)
            {
                _unitOfWork.Save();
                return BadRequest("Cannot ban user as they have toys in Renting or Awaiting status. Other toys have been banned.");
            }

            user.Status = "Inactive";
            _unitOfWork.UserRepository.Update(user);
            _unitOfWork.Save();

            return Ok("User banned and all toys updated successfully.");
        }


        private bool UserExists(int id)
        {
            return _unitOfWork.UserRepository.Get().Any(e => e.Id == id);
        }
    }
}
