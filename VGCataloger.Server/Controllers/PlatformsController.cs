using Microsoft.AspNetCore.Mvc;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Controllers;

[Route("platforms")]
public class PlatformsController(AppDbContext context) : LovControllerBase<Platform>(context);
