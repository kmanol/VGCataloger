namespace VGCataloger.Server.Services
{
    public record GamesQuery(
        int Page = 1,
        int PageSize = 25,
        string? Search = null,
        string? Platform = null,
        string? Genre = null,
        string? Status = null,
        string? Catalog = null,
        int? MinRating = null
    );
}
