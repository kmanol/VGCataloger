using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

public class SteamStartupService : IHostedService
{
    private readonly ILogger<SteamStartupService> _logger;
    private readonly IConfiguration _configuration;
    private readonly IMemoryCache _cache;

    public SteamStartupService(
        ILogger<SteamStartupService> logger,
        IConfiguration configuration,
        IMemoryCache cache)
    {
        _logger = logger;
        _configuration = configuration;
        _cache = cache;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        string baseUrl = _configuration["Steam:BaseUrl"] ?? "https://api.steampowered.com";
        string url = $"{baseUrl.TrimEnd('/')}/ISteamApps/GetAppList/v2/";

        using HttpClient client = new HttpClient();
        try
        {
            HttpResponseMessage response = await client.GetAsync(url, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                string json = await response.Content.ReadAsStringAsync(cancellationToken);
                _cache.Set("SteamAppList", json, TimeSpan.FromHours(12));
                _logger.LogInformation("Steam App List cached successfully.");
            }
            else
            {
                _logger.LogError("Steam API Error: {StatusCode} - {ReasonPhrase}", response.StatusCode, response.ReasonPhrase);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while calling Steam API.");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}