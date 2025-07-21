using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GamesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GamesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GameDto>>> Get()
        {
            try
            {
                var games = await _context.Games
                    .Include(g => g.GameDevelopers).ThenInclude(gd => gd.Developer)                    
                    .Include(g => g.GamePublishers).ThenInclude(gp => gp.Publisher)                    
                    .Include(g => g.GamePlatforms).ThenInclude(gp => gp.Platform)                    
                    .Include(g => g.GameGenres).ThenInclude(gg => gg.Genre)
                    .Include(g => g.GameTags).ThenInclude(gt => gt.Tag)
                    .Include(g => g.GameStatuses).ThenInclude(gs => gs.Status)
                    .Include(g => g.GameCatalogs).ThenInclude(gc => gc.Catalog)
                    .Select(g => new GameDto
                    {
                        Id = g.Id,
                        Title = g.Title,
                        ReleaseDate = g.ReleaseDate,
                        Developers = g.GameDevelopers.Select(gd => gd.Developer.Name).ToList(),
                        Publishers = g.GamePublishers.Select(gp => gp.Publisher.Name).ToList(),
                        Platforms = g.GamePlatforms.Select(gp => gp.Platform.Name).ToList(),
                        Genres = g.GameGenres.Select(gg => gg.Genre.Name).ToList(),
                        Tags = g.GameTags.Select(gt => gt.Tag.Name).ToList(),
                        Statuses = g.GameStatuses.Select(gs => gs.Status.Name).ToList(),
                        UserRating = g.UserRating,
                        Catalogs = g.GameCatalogs.Select(gc => gc.Catalog.Name).ToList()
                    })
                    .OrderBy(g => g.Title)
                    .ToListAsync();

                return Ok(games);
            }
            catch (Exception ex)
            {
                // Log the exception (in production, use a logger)
                return StatusCode(500, ex.ToString());
            }
        }

        [HttpPost]
        public async Task<ActionResult<GameDto>> Post(GameDto gameDto)
        {
            // Map DTO to Game entity
            var game = new Game
            {
                Title = gameDto.Title,
                ReleaseDate = gameDto.ReleaseDate,
                GameDevelopers = new List<GameDeveloper>(),
                GamePublishers = new List<GamePublisher>(),
                GamePlatforms = new List<GamePlatform>(),
                GameGenres = new List<GameGenre>(),
                GameTags = new List<GameTag>(),
                GameStatuses = new List<GameStatus>(),
                UserRating = gameDto.UserRating,
                GameCatalogs = new List<GameCatalog>()
            };

            // Attach developers
            foreach (var developerName in gameDto.Developers)
            {
                var developer = await _context.Developers.FirstOrDefaultAsync(d => d.Name == developerName);
                if (developer != null)
                {
                    game.GameDevelopers.Add(new GameDeveloper { Game = game, Developer = developer });
                }
            }

            // Attach publishers
            foreach (var publisherName in gameDto.Publishers)
            {
                var publisher = await _context.Publishers.FirstOrDefaultAsync(p => p.Name == publisherName);
                if (publisher != null)
                {
                    game.GamePublishers.Add(new GamePublisher { Game = game, Publisher = publisher });
                }
            }

            // Attach platforms
            foreach (var platformName in gameDto.Platforms)
            {
                var platform = await _context.Platforms.FirstOrDefaultAsync(p => p.Name == platformName);
                if (platform != null)
                {
                    game.GamePlatforms.Add(new GamePlatform { Game = game, Platform = platform });
                }
            }

            // Attach genres
            foreach (var genreName in gameDto.Genres)
            {
                var genre = await _context.Genres.FirstOrDefaultAsync(g => g.Name == genreName);
                if (genre != null)
                {
                    game.GameGenres.Add(new GameGenre { Game = game, Genre = genre });
                }
            }

            // Attach tags
            foreach (var tagName in gameDto.Tags)
            {
                var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == tagName);
                if (tag != null)
                {
                    game.GameTags.Add(new GameTag { Game = game, Tag = tag });
                }
            }

            // Attach statuses
            foreach (var statusName in gameDto.Statuses)
            {
                var status = await _context.Statuses.FirstOrDefaultAsync(s => s.Name == statusName);
                if (status != null)
                {
                    game.GameStatuses.Add(new GameStatus { Game = game, Status = status });
                }
            }

            // Attach catalogs
            foreach (var catalogName in gameDto.Catalogs)
            {
                var catalog = await _context.Catalogs.FirstOrDefaultAsync(c => c.Name == catalogName);
                if (catalog != null)
                {
                    game.GameCatalogs.Add(new GameCatalog { Game = game, Catalog = catalog });
                }
            }

            _context.Games.Add(game);
            await _context.SaveChangesAsync();

            // Prepare the response DTO
            var resultDto = new GameDto
            {
                Id = game.Id,
                Title = game.Title,
                ReleaseDate = game.ReleaseDate,
                Developers = game.GameDevelopers.Select(gd => gd.Developer.Name).ToList(),
                Publishers = game.GamePublishers.Select(gp => gp.Publisher.Name).ToList(),
                Platforms = game.GamePlatforms.Select(gp => gp.Platform.Name).ToList(),
                Genres = game.GameGenres.Select(gg => gg.Genre.Name).ToList(),
                Tags = game.GameTags.Select(gt => gt.Tag.Name).ToList(),
                Statuses = game.GameStatuses.Select(gs => gs.Status.Name).ToList(),
                UserRating = game.UserRating,
                Catalogs = game.GameCatalogs.Select(gc => gc.Catalog.Name).ToList()
            };

            return CreatedAtAction(nameof(Get), new { id = game.Id }, resultDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, GameDto gameDto)
        {
            var game = await _context.Games
                .Include(g => g.GameDevelopers)
                .Include(g => g.GamePublishers)
                .Include(g => g.GamePlatforms)
                .Include(g => g.GameGenres)
                .Include(g => g.GameTags)
                .Include(g => g.GameStatuses)
                .Include(g => g.GameCatalogs)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (game == null)
            {
                return NotFound();
            }

            // Update basic properties
            game.Title = gameDto.Title;
            game.ReleaseDate = gameDto.ReleaseDate;
            game.UserRating = gameDto.UserRating;

            // Update developers
            _context.GameDevelopers.RemoveRange(game.GameDevelopers);
            game.GameDevelopers.Clear();
            foreach (var developerName in gameDto.Developers)
            {
                var developer = await _context.Developers.FirstOrDefaultAsync(d => d.Name == developerName);
                if (developer != null)
                {
                    game.GameDevelopers.Add(new GameDeveloper { GameId = game.Id, DeveloperId = developer.Id, Developer = developer, Game = game });
                }
            }

            // Update publishers
            _context.GamePublishers.RemoveRange(game.GamePublishers);
            game.GamePublishers.Clear();
            foreach (var publisherName in gameDto.Publishers)
            {
                var publisher = await _context.Publishers.FirstOrDefaultAsync(p => p.Name == publisherName);
                if (publisher != null)
                {
                    game.GamePublishers.Add(new GamePublisher { GameId = game.Id, PublisherId = publisher.Id, Publisher = publisher, Game = game });
                }
            }

            // Update platforms
            _context.GamePlatforms.RemoveRange(game.GamePlatforms);
            game.GamePlatforms.Clear();
            foreach (var platformName in gameDto.Platforms)
            {
                var platform = await _context.Platforms.FirstOrDefaultAsync(p => p.Name == platformName);
                if (platform != null)
                {
                    game.GamePlatforms.Add(new GamePlatform { GameId = game.Id, PlatformId = platform.Id, Platform = platform, Game = game });
                }
            }

            // Update genres
            _context.GameGenres.RemoveRange(game.GameGenres);
            game.GameGenres.Clear();
            foreach (var genreName in gameDto.Genres)
            {
                var genre = await _context.Genres.FirstOrDefaultAsync(g => g.Name == genreName);
                if (genre != null)
                {
                    game.GameGenres.Add(new GameGenre { GameId = game.Id, GenreId = genre.Id, Genre = genre, Game = game });
                }
            }

            // Update tags
            _context.GameTags.RemoveRange(game.GameTags);
            game.GameTags.Clear();
            foreach (var tagName in gameDto.Tags)
            {
                var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == tagName);
                if (tag != null)
                {
                    game.GameTags.Add(new GameTag { GameId = game.Id, TagId = tag.Id, Tag = tag, Game = game });
                }
            }

            // Update statuses
            _context.GameStatuses.RemoveRange(game.GameStatuses);
            game.GameStatuses.Clear();
            foreach (var statusName in gameDto.Statuses)
            {
                var status = await _context.Statuses.FirstOrDefaultAsync(s => s.Name == statusName);
                if (status != null)
                {
                    game.GameStatuses.Add(new GameStatus { GameId = game.Id, StatusId = status.Id, Status = status, Game = game });
                }
            }

            // Update catalogs
            _context.GameCatalogs.RemoveRange(game.GameCatalogs);
            game.GameCatalogs.Clear();
            foreach (var catalogName in gameDto.Catalogs)
            {
                var catalog = await _context.Catalogs.FirstOrDefaultAsync(c => c.Name == catalogName);
                if (catalog != null)
                {
                    game.GameCatalogs.Add(new GameCatalog { GameId = game.Id, CatalogId = catalog.Id, Catalog = catalog, Game = game });
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var game = await _context.Games
                .Include(g => g.GameDevelopers)
                .Include(g => g.GamePublishers)
                .Include(g => g.GamePlatforms)
                .Include(g => g.GameGenres)
                .Include(g => g.GameTags)
                .Include(g => g.GameStatuses)
                .Include(g => g.GameCatalogs)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (game == null)
            {
                return NotFound();
            }

            // Remove related join entities
            _context.GameDevelopers.RemoveRange(game.GameDevelopers);
            _context.GamePublishers.RemoveRange(game.GamePublishers);
            _context.GamePlatforms.RemoveRange(game.GamePlatforms);
            _context.GameGenres.RemoveRange(game.GameGenres);
            _context.GameTags.RemoveRange(game.GameTags);
            _context.GameStatuses.RemoveRange(game.GameStatuses);
            _context.GameCatalogs.RemoveRange(game.GameCatalogs);

            // Remove the game
            _context.Games.Remove(game);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}