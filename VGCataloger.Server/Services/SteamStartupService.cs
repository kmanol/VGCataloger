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
        string? apiKey = _configuration["Steam:ApiKey"];
        
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("Steam API Key not configured. Skipping Steam App List cache.");
            return;
        }

        string url = $"{baseUrl.TrimEnd('/')}/IStoreService/GetAppList/v1/?key={apiKey}&input_json={{}}";

        using HttpClient client = new HttpClient();
        try
        {
            HttpResponseMessage response = await client.GetAsync(url, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                string json = await response.Content.ReadAsStringAsync(cancellationToken);

                // Parse and deduplicate
                using var doc = System.Text.Json.JsonDocument.Parse(json);
                var root = doc.RootElement;
                
                // IStoreService returns apps directly in the response
                if (root.TryGetProperty("response", out var responseElement) &&
                    responseElement.TryGetProperty("apps", out var apps))
                {
                    var seenNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                    var dedupedApps = new List<System.Text.Json.JsonElement>();

                    foreach (var app in apps.EnumerateArray())
                    {
                        string name = app.GetProperty("name").GetString() ?? "";
                        if (seenNames.Add(name))
                        {
                            dedupedApps.Add(app);
                        }
                    }

                    // Build new JSON structure
                    var result = new
                    {
                        response = new
                        {
                            apps = dedupedApps
                        }
                    };

                    string dedupedJson = System.Text.Json.JsonSerializer.Serialize(result);

                    _cache.Set("SteamAppList", dedupedJson, TimeSpan.FromHours(12));
                    _logger.LogInformation("Steam App List cached successfully (deduplicated).");
                }
                else
                {
                    _logger.LogError("Unexpected response structure from Steam API.");
                }
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