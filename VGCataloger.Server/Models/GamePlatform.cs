namespace VGCataloger.Server.Models
{
    public class GamePlatform
    {
        public int GameId { get; set; }
        public required Game Game { get; set; }           // Navigation property

        public int PlatformId { get; set; }
        public required Platform Platform { get; set; }   // Navigation property
    }
}