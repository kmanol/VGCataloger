using Microsoft.AspNetCore.Mvc;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Controllers;

[Route("catalogs")]
public class CatalogsController(AppDbContext context) : LovControllerBase<Catalog>(context);
