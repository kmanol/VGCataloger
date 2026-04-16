using Microsoft.AspNetCore.Mvc;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Controllers;

[Route("developers")]
public class DevelopersController(AppDbContext context) : LovControllerBase<Developer>(context);
