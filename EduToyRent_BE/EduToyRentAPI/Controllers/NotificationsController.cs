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
using EduToyRentRepositories.DTO.Request;
using Microsoft.AspNetCore.SignalR;
using EduToyRentAPI.Hubs;

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHubContext<NotificationHub> _hubContext;
        public NotificationsController(IUnitOfWork unitOfWork, IHubContext<NotificationHub> hubContext)
        {
            _unitOfWork = unitOfWork;
            _hubContext = hubContext;
        }

        // GET: api/v1/Notifications
        [HttpGet]
        public ActionResult<IEnumerable<NotificationResponse>> GetNotifications(int pageIndex = 1, int pageSize = 50)
        {
            var notifications = _unitOfWork.NotificationRepository.Get(
                includeProperties: "User",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(n => n.SentTime)
                .Select(notification => new NotificationResponse
                {
                    Id = notification.Id,
                    Notify = notification.Notify,
                    SentTime = notification.SentTime,
                    IsRead = notification.IsRead,
                    UserId = notification.UserId,
                }).ToList();

            return Ok(notifications);
        }

        // GET: api/v1/Notifications/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<NotificationResponse>> GetNotification(int id)
        {
            var notification = _unitOfWork.NotificationRepository.GetByID(id);

            if (notification == null)
            {
                return NotFound();
            }

            var notificationResponse = new NotificationResponse
            {
                Id = notification.Id,
                Notify = notification.Notify,
                SentTime = notification.SentTime,
                IsRead = notification.IsRead,
                UserId = notification.UserId,
            };

            return Ok(notificationResponse);
        }

        // GET: api/v1/Notifications/User/{userId}
        [HttpGet("User/{userId}")]
        public ActionResult<IEnumerable<NotificationResponse>> GetNotificationsByUser(int userId, int pageIndex = 1, int pageSize = 50)
        {
            var notifications = _unitOfWork.NotificationRepository.Get(
                n => n.UserId == userId,
                includeProperties: "User",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(n => n.SentTime)
                .Select(notification => new NotificationResponse
                {
                    Id = notification.Id,
                    Notify = notification.Notify,
                    SentTime = notification.SentTime,
                    IsRead = notification.IsRead,
                    UserId = notification.UserId,
                }).ToList();

            return Ok(notifications);
        }

        // PUT: api/v1/Notifications/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNotification(int id, NotificationRequest notificationRequest)
        {
            var notification = _unitOfWork.NotificationRepository.GetByID(id);

            if (notification == null)
            {
                return NotFound();
            }

            notification.Notify = notificationRequest.Notify;
            notification.IsRead = (bool)notificationRequest.IsRead;

            _unitOfWork.NotificationRepository.Update(notification);
            await _unitOfWork.SaveAsync();

            return NoContent();
        }

        // POST: api/v1/Notifications
        //[HttpPost]
        //public async Task<ActionResult<NotificationResponse>> CreateNotification(NotificationRequest notificationRequest)
        //{
        //    var notification = new Notification
        //    {
        //        Notify = notificationRequest.Notify,
        //        SentTime = DateTime.UtcNow,
        //        IsRead = false,
        //        UserId = notificationRequest.UserId
        //    };

        //    _unitOfWork.NotificationRepository.Insert(notification);
        //    await _unitOfWork.SaveAsync();

        //    var notificationResponse = new NotificationResponse
        //    {
        //        Id = notification.Id,
        //        Notify = notification.Notify,
        //        SentTime = notification.SentTime,
        //        IsRead = notification.IsRead,
        //        UserId = notification.UserId,
        //    };

        //    return CreatedAtAction("GetNotification", new { id = notification.Id }, notificationResponse);
        //}

        // DELETE: api/v1/Notifications/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var notification = _unitOfWork.NotificationRepository.GetByID(id);

            if (notification == null)
            {
                return NotFound();
            }

            _unitOfWork.NotificationRepository.Delete(notification);
            await _unitOfWork.SaveAsync();

            return NoContent();
        }

        // PUT: api/v1/Notifications/MarkRead/{userId}
        [HttpPut("MarkRead/{userId}")]
        public async Task<IActionResult> MarkAllNotificationsAsRead(int userId)
        {
            var notifications = _unitOfWork.NotificationRepository.GetV2(
                n => n.UserId == userId && !n.IsRead);

            if (!notifications.Any())
            {
                return Ok("All notifications are already read or no notifications found.");
            }

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                _unitOfWork.NotificationRepository.Update(notification);
            }

            await _unitOfWork.SaveAsync();

            return Ok("All notifications marked as read.");
        }
        [HttpPost]
        public async Task<ActionResult<NotificationResponse>> AddNotification(NotificationRequest notificationRequest)
        {
            var notification = new Notification
            {
                Notify = notificationRequest.Notify,
                SentTime = DateTime.Now,
                IsRead = false,
                UserId = notificationRequest.UserId
            };

            _unitOfWork.NotificationRepository.Insert(notification);
            await _unitOfWork.SaveAsync();

            var notificationResponse = new NotificationResponse
            {
                Id = notification.Id,
                Notify = notification.Notify,
                SentTime = notification.SentTime,
                IsRead = notification.IsRead,
                UserId = notification.UserId,
            };

            await _hubContext.Clients.Group($"User-{notification.UserId}")
                .SendAsync("ReceiveNotification", notificationResponse);

            return CreatedAtAction("GetNotification", new { id = notification.Id }, notificationResponse);
        }
        private bool NotificationExists(int id)
        {
            return _unitOfWork.NotificationRepository.Get().Any(n => n.Id == id);
        }
    }
}
