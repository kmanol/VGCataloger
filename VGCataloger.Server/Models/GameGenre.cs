namespace VGCataloger.Server.Models
{
    public class GameGenre
    {
        public int GameId { get; set; }
        public required Game Game { get; set; }     // Navigation property

        public int GenreId { get; set; }
        public required Genre Genre { get; set; }   // Navigation property
    }
}