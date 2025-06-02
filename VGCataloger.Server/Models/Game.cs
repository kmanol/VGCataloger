namespace VGCataloger.Server
{
    public class Game
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string[] Tags { get; set; } = Array.Empty<string>();
        public DateTime ReleaseDate { get; set; }
        // Add more metadata fields as needed, e.g.:
        // public string Developer { get; set; }
        // public string Publisher { get; set; }
        // public double Rating { get; set; }
    }
}