public class GameDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public DateTime ReleaseDate { get; set; }
    public required List<string> Platforms { get; set; }
    public required List<string> Genres { get; set; }
    public required List<string> Tags { get; set; }
}