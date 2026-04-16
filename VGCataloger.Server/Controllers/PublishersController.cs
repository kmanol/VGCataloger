using Microsoft.AspNetCore.Mvc;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Controllers;

[Route("publishers")]
public class PublishersController(AppDbContext context) : LovControllerBase<Publisher>(context);
