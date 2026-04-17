using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using VGCataloger.Server.Data;
using VGCataloger.Server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();

builder.Services.AddScoped<IGamesService, GamesService>();
builder.Services.AddHostedService<SteamStartupService>();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();