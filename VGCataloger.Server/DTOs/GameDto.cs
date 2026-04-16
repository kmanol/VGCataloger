public class GameDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public DateTime ReleaseDate { get; set; }
    public required List<string> Developers { get; set; }
    public required List<string> Publishers { get; set; }
    public required List<string> Platforms { get; set; }
    public required List<string> Genres { get; set; }
    public required List<string> Tags { get; set; }
    public required List<string> Statuses { get; set; }
    public required List<string> Catalogs { get; set; }
    public int? UserRating { get; set; }
    public int? SteamAppId { get; set; }
}