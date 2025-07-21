namespace VGCataloger.Server.Models
{
    public class GameCatalog
    {
        public int GameId { get; set; }
        public required Game Game { get; set; }

        public int CatalogId { get; set; }
        public required Catalog Catalog { get; set; }
    }
}