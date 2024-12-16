namespace EduToyRentAPI.GmailService
{
    public interface IMailService
    {
        Task SendEmailAsync(string toEmail, string subject, string message);
    }
}
