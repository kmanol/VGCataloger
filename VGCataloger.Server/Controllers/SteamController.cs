using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Globalization;
using System.Text.Json;
using VGCataloger.Server.DTOs;

[ApiController]
[Route("[controller]")]
public class SteamController : ControllerBase
{
    private readonly IMemoryCache _cache;

    private readonly IHttpClientFactory _http;

    public SteamController(IMemoryCache cache, IHttpClientFactory http)
    {
        _cache = cache;
        _http = http;
    }

    [HttpGet("appdetails/{appid:int}")]
    public async Task<ActionResult<SteamAppDetailsDto>> GetAppDetails(int appid)
    {
        try
        {
            var client = _http.CreateClient();
            var response = await client.GetAsync(
                $"https://store.steampowered.com/api/appdetails?appids={appid}");

            if (!response.IsSuccessStatusCode)
                return StatusCode(502, "Steam API unavailable.");

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty(appid.ToString(), out var appElem) ||
                !appElem.TryGetProperty("success", out var successProp) ||
                !successProp.GetBoolean() ||
                !appElem.TryGetProperty("data", out var data))
                return NotFound();

            var dto = new SteamAppDetailsDto();

            // Release date — Steam format varies ("21 Oct, 2019", "Oct 21, 2019", etc.)
            if (data.TryGetProperty("release_date", out var rd) &&
                rd.TryGetProperty("coming_soon", out var comingSoon) && !comingSoon.GetBoolean() &&
                rd.TryGetProperty("date", out var dateProp))
            {
                var dateStr = dateProp.GetString();
                if (DateTime.TryParse(dateStr, CultureInfo.InvariantCulture,
                        DateTimeStyles.None, out var parsed))
                    dto.ReleaseDate = parsed.ToString("yyyy-MM-dd");
            }

            if (data.TryGetProperty("developers", out var devs))
                dto.Developers = devs.EnumerateArray()
                    .Select(d => d.GetString()).OfType<string>().ToList();

            if (data.TryGetProperty("publishers", out var pubs))
                dto.Publishers = pubs.EnumerateArray()
                    .Select(p => p.GetString()).OfType<string>().ToList();

            if (data.TryGetProperty("genres", out var genres))
                dto.Genres = genres.EnumerateArray()
                    .Where(g => g.TryGetProperty("description", out _))
                    .Select(g => g.GetProperty("description").GetString()).OfType<string>()
                    .ToList();

            if (data.TryGetProperty("categories", out var categories))
                dto.Tags = categories.EnumerateArray()
                    .Where(c => c.TryGetProperty("description", out _))
                    .Select(c => c.GetProperty("description").GetString()).OfType<string>()
                    .ToList();

            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Failed to fetch Steam app details. " + ex.Message);
        }
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
            // Cache now stores IStoreService response shape: { response: { apps: [...] } }
            if (!doc.RootElement.TryGetProperty("response", out var responseElem) ||
                !responseElem.TryGetProperty("apps", out var appsElem) ||
                appsElem.ValueKind != JsonValueKind.Array)
            {
                return Ok(new { apps = Array.Empty<object>() });
            }

            var matches = appsElem.EnumerateArray()
                .Where(app =>
                {
                    if (!app.TryGetProperty("name", out var nameProp))
                        return false;
                    var name = nameProp.GetString();
                    return name != null && name.Contains(search, StringComparison.OrdinalIgnoreCase);
                })
                .Take(50)
                .Select(app => app.GetRawText());

            var jsonArray = "[" + string.Join(",", matches) + "]";
            return Content(jsonArray, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Failed to parse Steam app list. " + ex.Message);
        }
    }
}