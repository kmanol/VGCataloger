using Microsoft.AspNetCore.Mvc;
using VGCataloger.Server.DTOs;
using VGCataloger.Server.Services;

namespace VGCataloger.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GamesController : ControllerBase
    {
        private readonly IGamesService _games;

        public GamesController(IGamesService games)
        {
            _games = games;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<GameDto>>> Get(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 25,
            [FromQuery] string? search = null,
            [FromQuery] string? platform = null,
            [FromQuery] string? genre = null,
            [FromQuery] string? status = null,
            [FromQuery] string? catalog = null,
            [FromQuery] int? minRating = null)
        {
            try
            {
                var result = await _games.GetGamesAsync(new GamesQuery(page, pageSize, search, platform, genre, status, catalog, minRating));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.ToString());
            }
        }

        [HttpPost]
        public async Task<ActionResult<GameDto>> Post(GameDto dto)
        {
            var result = await _games.CreateGameAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, GameDto dto)
        {
            var found = await _games.UpdateGameAsync(id, dto);
            return found ? NoContent() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var found = await _games.DeleteGameAsync(id);
            return found ? NoContent() : NotFound();
        }
    }
}
