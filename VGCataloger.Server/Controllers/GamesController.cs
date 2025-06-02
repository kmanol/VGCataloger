using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using VGCataloger.Server;

namespace VGCataloger.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GamesController : ControllerBase
    {
        private readonly string _dataFile = Path.Combine("Data", "games.json");

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Game>>> Get()
        {
            if (!System.IO.File.Exists(_dataFile))
                return NotFound("Game data file not found.");

            using var stream = System.IO.File.OpenRead(_dataFile);
            var games = await JsonSerializer.DeserializeAsync<List<Game>>(stream, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return Ok(games ?? new List<Game>());
        }
    }
}
