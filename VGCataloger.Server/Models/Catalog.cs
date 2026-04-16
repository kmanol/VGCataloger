namespace VGCataloger.Server.Models
{
    public class Catalog : INamedEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}