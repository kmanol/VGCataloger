using Microsoft.EntityFrameworkCore;
using VGCataloger.Server.Data;
using VGCataloger.Server.DTOs;
using VGCataloger.Server.Models;
using VGCataloger.Server;

namespace VGCataloger.Server.Services
{
    public class GamesService : IGamesService
    {
        private readonly AppDbContext _context;

        public GamesService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<GameDto>> GetGamesAsync(GamesQuery query)
        {
            var q = _context.Games.AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
                q = q.Where(g => g.Title.Contains(query.Search));

            if (!string.IsNullOrWhiteSpace(query.Platform))
                q = q.Where(g => g.GamePlatforms.Any(gp => gp.Platform.Name == query.Platform));

            if (!string.IsNullOrWhiteSpace(query.Genre))
                q = q.Where(g => g.GameGenres.Any(gg => gg.Genre.Name == query.Genre));

            if (!string.IsNullOrWhiteSpace(query.Status))
                q = q.Where(g => g.GameStatuses.Any(gs => gs.Status.Name == query.Status));

            if (!string.IsNullOrWhiteSpace(query.Catalog))
                q = q.Where(g => g.GameCatalogs.Any(gc => gc.Catalog.Name == query.Catalog));

            if (query.MinRating.HasValue)
                q = q.Where(g => g.UserRating >= query.MinRating.Value);

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderBy(g => g.Title)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
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
                    SteamAppId = g.SteamAppId,
                    Catalogs = g.GameCatalogs.Select(gc => gc.Catalog.Name).ToList()
                })
                .ToListAsync();

            return new PagedResult<GameDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            };
        }

        public async Task<GameDto> CreateGameAsync(GameDto dto)
        {
            var game = new Game
            {
                Title = dto.Title,
                ReleaseDate = dto.ReleaseDate,
                UserRating = dto.UserRating,
                SteamAppId = dto.SteamAppId,
                GameDevelopers = new List<GameDeveloper>(),
                GamePublishers = new List<GamePublisher>(),
                GamePlatforms = new List<GamePlatform>(),
                GameGenres = new List<GameGenre>(),
                GameTags = new List<GameTag>(),
                GameStatuses = new List<GameStatus>(),
                GameCatalogs = new List<GameCatalog>()
            };

            foreach (var name in dto.Developers)
                game.GameDevelopers.Add(new GameDeveloper { Game = game, Developer = await UpsertAsync(_context.Developers, name) });

            foreach (var name in dto.Publishers)
                game.GamePublishers.Add(new GamePublisher { Game = game, Publisher = await UpsertAsync(_context.Publishers, name) });

            foreach (var name in dto.Platforms)
                game.GamePlatforms.Add(new GamePlatform { Game = game, Platform = await UpsertAsync(_context.Platforms, name) });

            foreach (var name in dto.Genres)
                game.GameGenres.Add(new GameGenre { Game = game, Genre = await UpsertAsync(_context.Genres, name) });

            foreach (var name in dto.Tags)
                game.GameTags.Add(new GameTag { Game = game, Tag = await UpsertAsync(_context.Tags, name) });

            foreach (var name in dto.Statuses)
                game.GameStatuses.Add(new GameStatus { Game = game, Status = await UpsertAsync(_context.Statuses, name) });

            foreach (var name in dto.Catalogs)
                game.GameCatalogs.Add(new GameCatalog { Game = game, Catalog = await UpsertAsync(_context.Catalogs, name) });

            _context.Games.Add(game);
            await _context.SaveChangesAsync();

            return new GameDto
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
                SteamAppId = game.SteamAppId,
                Catalogs = game.GameCatalogs.Select(gc => gc.Catalog.Name).ToList()
            };
        }

        public async Task<bool> UpdateGameAsync(int id, GameDto dto)
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

            if (game == null) return false;

            game.Title = dto.Title;
            game.ReleaseDate = dto.ReleaseDate;
            game.UserRating = dto.UserRating;
            game.SteamAppId = dto.SteamAppId;

            _context.GameDevelopers.RemoveRange(game.GameDevelopers);
            game.GameDevelopers.Clear();
            foreach (var name in dto.Developers)
                game.GameDevelopers.Add(new GameDeveloper { GameId = game.Id, Game = game, Developer = await UpsertAsync(_context.Developers, name) });

            _context.GamePublishers.RemoveRange(game.GamePublishers);
            game.GamePublishers.Clear();
            foreach (var name in dto.Publishers)
                game.GamePublishers.Add(new GamePublisher { GameId = game.Id, Game = game, Publisher = await UpsertAsync(_context.Publishers, name) });

            _context.GamePlatforms.RemoveRange(game.GamePlatforms);
            game.GamePlatforms.Clear();
            foreach (var name in dto.Platforms)
                game.GamePlatforms.Add(new GamePlatform { GameId = game.Id, Game = game, Platform = await UpsertAsync(_context.Platforms, name) });

            _context.GameGenres.RemoveRange(game.GameGenres);
            game.GameGenres.Clear();
            foreach (var name in dto.Genres)
                game.GameGenres.Add(new GameGenre { GameId = game.Id, Game = game, Genre = await UpsertAsync(_context.Genres, name) });

            _context.GameTags.RemoveRange(game.GameTags);
            game.GameTags.Clear();
            foreach (var name in dto.Tags)
                game.GameTags.Add(new GameTag { GameId = game.Id, Game = game, Tag = await UpsertAsync(_context.Tags, name) });

            _context.GameStatuses.RemoveRange(game.GameStatuses);
            game.GameStatuses.Clear();
            foreach (var name in dto.Statuses)
                game.GameStatuses.Add(new GameStatus { GameId = game.Id, Game = game, Status = await UpsertAsync(_context.Statuses, name) });

            _context.GameCatalogs.RemoveRange(game.GameCatalogs);
            game.GameCatalogs.Clear();
            foreach (var name in dto.Catalogs)
                game.GameCatalogs.Add(new GameCatalog { GameId = game.Id, Game = game, Catalog = await UpsertAsync(_context.Catalogs, name) });

            await _context.SaveChangesAsync();
            return true;
        }

        // Returns the existing entity by name, or creates and tracks a new one.
        private async Task<T> UpsertAsync<T>(DbSet<T> set, string name)
            where T : class, INamedEntity, new()
        {
            var entity = await set.FirstOrDefaultAsync(e => e.Name == name);
            if (entity != null) return entity;

            entity = new T { Name = name };
            set.Add(entity);
            return entity;
        }

        public async Task<bool> DeleteGameAsync(int id)
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

            if (game == null) return false;

            _context.GameDevelopers.RemoveRange(game.GameDevelopers);
            _context.GamePublishers.RemoveRange(game.GamePublishers);
            _context.GamePlatforms.RemoveRange(game.GamePlatforms);
            _context.GameGenres.RemoveRange(game.GameGenres);
            _context.GameTags.RemoveRange(game.GameTags);
            _context.GameStatuses.RemoveRange(game.GameStatuses);
            _context.GameCatalogs.RemoveRange(game.GameCatalogs);
            _context.Games.Remove(game);

            await _context.SaveChangesAsync();
            return true;
        }

    }
}
