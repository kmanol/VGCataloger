using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;

[ApiController]
[Route("[controller]")]
public class SteamController : ControllerBase
{
    private readonly IMemoryCache _cache;

    public SteamController(IMemoryCache cache)
    {
        _cache = cache;
    }

    [HttpGet("applist")]
    public IActionResult GetAppList([FromQuery] string? search = null)
    {
        if (!_cache.TryGetValue("SteamAppList", out string? json) || string.IsNullOrWhiteSpace(json))
            return NotFound();

        if (string.IsNullOrWhiteSpace(search))
            return Ok(new { apps = Array.Empty<object>() });

        try
        {
            using var doc = JsonDocument.Parse(json);
            if (!doc.RootElement.TryGetProperty("applist", out var applistElem) ||
                !applistElem.TryGetProperty("apps", out var appsElem) ||
                appsElem.ValueKind != JsonValueKind.Array)
            {
                return Ok(new { apps = Array.Empty<object>() });
            }

            var matches = appsElem.EnumerateArray()
                .Where(app =>
                    app.TryGetProperty("name", out var nameProp) &&
                    nameProp.GetString() != null &&
                    nameProp.GetString().Contains(search, StringComparison.OrdinalIgnoreCase))
                .Take(50)
                .Select(app => app.GetRawText());

            var jsonArray = "[" + string.Join(",", matches) + "]";
            return Content(jsonArray, "application/json");
        }
        catch (Exception ex)
        {
            // Optionally log ex.ToString() here
            return StatusCode(500, "Failed to parse Steam app list.");
        }
    }
}