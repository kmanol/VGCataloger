namespace VGCataloger.Server.DTOs
{
    public class SteamAppDetailsDto
    {
        public string? ReleaseDate { get; set; }   // ISO yyyy-MM-dd, or null if unparseable
        public List<string> Developers { get; set; } = [];
        public List<string> Publishers { get; set; } = [];
        public List<string> Genres { get; set; } = [];
        public List<string> Tags { get; set; } = [];
    }
}
