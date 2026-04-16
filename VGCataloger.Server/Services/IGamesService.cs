using VGCataloger.Server.DTOs;

namespace VGCataloger.Server.Services
{
    public interface IGamesService
    {
        Task<PagedResult<GameDto>> GetGamesAsync(GamesQuery query);
        Task<GameDto> CreateGameAsync(GameDto dto);
        Task<bool> UpdateGameAsync(int id, GameDto dto);
        Task<bool> DeleteGameAsync(int id);
    }
}
