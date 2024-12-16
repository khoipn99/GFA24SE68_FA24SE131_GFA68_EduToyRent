using MailKit.Net.Smtp;
using MimeKit;
using System.Threading.Tasks;

namespace EduToyRentAPI.GmailService
{
    public class GmailMailService : IMailService
    {
        private readonly string _fromEmail;
        private readonly string _appPassword;
        private readonly string _displayName;
        private readonly string _smtpServer;
        private readonly int _port;

        public GmailMailService(string fromEmail, string password, string smtpServer, int port, string displayName = "")
        {
            _fromEmail = fromEmail;
            _appPassword = password;
            _smtpServer = smtpServer;
            _port = port;
            _displayName = displayName;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string otp)
        {
            var emailMessage = new MimeMessage();
            emailMessage.From.Add(new MailboxAddress(_displayName, _fromEmail));
            emailMessage.To.Add(MailboxAddress.Parse(toEmail));
            emailMessage.Subject = subject;

            var builder = new BodyBuilder();
            builder.HtmlBody = $@"
            <html>
            <head>
            <style>
              body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
              }}
              .container {{
                background: #fff;
                padding: 20px;
                border-radius: 8px;
                max-width: 400px;
                margin: 0 auto;
                text-align: center;
              }}
              h1 {{
                color: #1890ff;
              }}
              p {{
                font-size: 14px;
                margin: 8px 0;
              }}
              .otp {{
                font-size: 24px;
                color: #ff4d4f;
                font-weight: bold;
              }}
            </style>
            </head>
            <body>
              <div class='container'>
                <img src='https://drive.google.com/uc?export=view&id=1pKnr6_kjPEcXpoAFWmH3Cc0TZZt3TCCg' alt='Logo' width='100' style='margin-bottom:20px;'/>
                <h1>Đặt lại mật khẩu</h1>
                <p>Xin chào,</p>
                <p>Mã OTP của bạn là:</p>
                <p class='otp'>{otp}</p>
                <p>OTP có hiệu lực trong 5 phút.</p>
                <p>Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
                <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
              </div>
            </body>
            </html>
            ";

            emailMessage.Body = builder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync("smtp.gmail.com", 465, MailKit.Security.SecureSocketOptions.SslOnConnect);
                await client.AuthenticateAsync(_fromEmail, _appPassword);
                await client.SendAsync(emailMessage);
                await client.DisconnectAsync(true);
            }
        }
    }
}