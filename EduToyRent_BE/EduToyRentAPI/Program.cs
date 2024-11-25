using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OData.Edm;
using Microsoft.OData.ModelBuilder;
using Microsoft.OpenApi.Models;
using EduToyRentAPI.JwtServices.IServices;
using EduToyRentAPI.JwtServices;
using EduToyRentRepositories.Implement;
using EduToyRentRepositories.Interface;
using EduToyRentRepositories.Models;
using System.Text;
using Google.Cloud.Storage.V1;
using EduToyRentAPI.FireBaseService;
using EduToyRentAPI.Middlewares;
using EduToyRentAPI.KeyVaultService;
using Microsoft.Azure.KeyVault;
using Microsoft.Azure.Services.AppAuthentication;
using Microsoft.Extensions.Configuration.AzureKeyVault;
using Azure.Security.KeyVault.Secrets;
using Azure.Identity;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsProduction())
{
    var keyVaultUrl = builder.Configuration["KeyVault:KeyVaultURL"];

    var client = new SecretClient(new Uri(keyVaultUrl), new DefaultAzureCredential());

    builder.Services.AddDbContext<EduToyRentDBContext>(options =>
    {
        var connectionString = client.GetSecret("ProdConnection").Value.Value.ToString();
        options.UseSqlServer(connectionString);
    });


    //var keyVaultURL = builder.Configuration.GetSection("KeyVault:KeyVaultURL");

    //var keyVaultClient = new KeyVaultClient(new KeyVaultClient.AuthenticationCallback(new AzureServiceTokenProvider().KeyVaultTokenCallback));

    //builder.Configuration.AddAzureKeyVault(keyVaultURL.Value!.ToString(), new DefaultKeyVaultSecretManager());

    //var client = new SecretClient(new Uri(keyVaultURL!.Value!.ToString()), new DefaultAzureCredential());

    //var connectionString = client.GetSecret("ProdConnection").Value.Value.ToString();
    //Console.WriteLine("Connection String: " + connectionString);

    //builder.Services.AddDbContext<EduToyRentDBContext>(option =>
    //{        
    //    option.UseSqlServer(connectionString);
    //});

    var connectionString = builder.Configuration.GetConnectionString("MyDB");
    builder.Services.AddDbContext<EduToyRentDBContext>(options =>
        options.UseSqlServer(connectionString));

    var jsonContent = client.GetSecret("firebase-adminsdk").Value.Value;
    File.WriteAllText("google-credentials.json", jsonContent);
    Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", "google-credentials.json");
}

if (builder.Environment.IsDevelopment())
{
    var connectionString = builder.Configuration.GetConnectionString("MyDB");
    builder.Services.AddDbContext<EduToyRentDBContext>(options =>
        options.UseSqlServer(connectionString));

    Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", builder.Configuration["FirebaseCredentials:Path"]);
}

// Add services to the container.
builder.Services.AddSingleton<IJwtGeneratorTokenService, JwtGeneratorTokenService>();
builder.Services.AddSingleton(opt => StorageClient.Create());
builder.Services.AddScoped<IFireBaseService, FireBaseService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddCors();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers().AddOData(opt => opt.Select().Filter().Count().OrderBy().Expand().SetMaxTop(null).AddRouteComponents("odata", GetEdmModel()));
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});
//builder.Services.AddAuthorization(options =>
//{
//    options.AddPolicy("CustomerPolicy", policy => policy.RequireRole("4"));
//});
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminPolicy", policy => policy.RequireRole("1"));
    options.AddPolicy("MemberPolicy", policy => policy.RequireRole("3"));
    options.AddPolicy("SupplierPolicy", policy => policy.RequireRole("2"));
    options.AddPolicy("StaffPolicy", policy => policy.RequireRole("4"));
});
builder.Services.AddSwaggerGen(option =>
{
    option.DescribeAllParametersInCamelCase();
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
});


var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseCors(options => options.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
static IEdmModel GetEdmModel()
{
    ODataConventionModelBuilder builder = new();
    return builder.GetEdmModel();
}
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
