using Microsoft.EntityFrameworkCore;
using VGCataloger.Server.Data;
using VGCataloger.Server.Services;

namespace VGCataloger.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Load local appsettings if it exists
            var localSettingsPath = Path.Combine(builder.Environment.ContentRootPath, "appsettings.local.json");
            if (File.Exists(localSettingsPath))
            {
                builder.Configuration.AddJsonFile(localSettingsPath, optional: false, reloadOnChange: true);
            }

            // Add services to the container.
            builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
            builder.Services.AddScoped<IGamesService, GamesService>();
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(); // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddHostedService<SteamStartupService>();
            builder.Services.AddMemoryCache();

            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.MapControllers();
            app.MapFallbackToFile("/index.html");
            app.Run();
        }
    }
}
