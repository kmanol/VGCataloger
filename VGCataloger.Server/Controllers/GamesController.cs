using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using VGCataloger.Server.DTOs;
using VGCataloger.Server.Services;

namespace VGCataloger.Server.Controllers;

[ApiController]
[Route("[controller]")]
public class GamesController(IGamesService games, ILogger<GamesController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<GameDto>>> Get(
        [FromQuery][Range(1, int.MaxValue)] int page = 1,
        [FromQuery][Range(1, 200)] int pageSize = 25,
        [FromQuery] string? search = null,
        [FromQuery] string? platform = null,
        [FromQuery] string? genre = null,
        [FromQuery] string? status = null,
        [FromQuery] string? catalog = null,
        [FromQuery] int? minRating = null)
    {
        try
        {
            var result = await games.GetGamesAsync(new GamesQuery(page, pageSize, search, platform, genre, status, catalog, minRating));
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve games");
            return Problem("An error occurred while retrieving games.");
        }
    }

    [HttpPost]
    public async Task<ActionResult<GameDto>> Post(GameDto dto)
    {
        var result = await games.CreateGameAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, GameDto dto)
    {
        var found = await games.UpdateGameAsync(id, dto);
        return found ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var found = await games.DeleteGameAsync(id);
        return found ? NoContent() : NotFound();
    }
}
