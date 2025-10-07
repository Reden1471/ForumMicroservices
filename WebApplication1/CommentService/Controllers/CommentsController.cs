using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using CommonModels.Models;

namespace CommentService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CommentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/comments
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Comment>>> GetComments()
        {
            return await _context.Comments.ToListAsync();
        }

        // GET: api/comments/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Comment>> GetComment(int id)
        {
            var comment = await _context.Comments.FindAsync(id);

            if (comment == null)
            {
                return NotFound();
            }

            return comment;
        }

        // GET: api/comments/post/5
        [HttpGet("post/{postId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Comment>>> GetCommentsByPost(int postId)
        {
            return await _context.Comments
                .Where(c => c.PostId == postId)
                .ToListAsync();
        }

        // POST: api/comments
        [HttpPost]
        [Authorize] // ONLY SIGNED IN USERS
        public async Task<ActionResult<Comment>> PostComment(Comment comment)
        {
            // 1. Extract userId from token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user ID in token");
            }

            // 2. DEBUG:
            //Console.WriteLine($"=== DEBUG ===");
            //Console.WriteLine($"User ID from token: {userId}");
            //Console.WriteLine($"Original Comment UserId: {comment.UserId}");

            // 3. USERID BEÁLLÍTÁSA - EZ A KULCSFONTOSSÁGU LÉPÉS!
            comment.UserId = userId; // Felülírjuk a kérésből jövő értéket

            //Console.WriteLine($"Comment UserId after setting: {comment.UserId}");

            // 4. Check if user exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            //Console.WriteLine($"User exists in database: {userExists}");

            if (!userExists)
            {
                return BadRequest("User does not exist");
            }

            try
            {
                _context.Comments.Add(comment);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetComment", new { id = comment.Id }, comment);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SAVE ERROR: {ex.Message}");
                return StatusCode(500, $"Database error: {ex.InnerException?.Message}");
            }
        }

        // PUT: api/comments/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutComment(int id, Comment comment)
        {
            if (id != comment.Id)
            {
                return BadRequest();
            }

            // Check if user owns the comment or is admin/moderator
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var existingComment = await _context.Comments.FindAsync(id);

            if (existingComment == null)
            {
                return NotFound();
            }

            if (existingComment.UserId != userId && userRole != "Admin" && userRole != "Moderator")
            {
                return Forbid("You can only edit your own comments");
            }

            existingComment.Content = comment.Content;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CommentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/comments/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
            {
                return NotFound();
            }

            // Check if user owns the comment or is admin/moderator
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (comment.UserId != userId && userRole != "Admin" && userRole != "Moderator")
            {
                return Forbid("You can only delete your own comments");
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CommentExists(int id)
        {
            return _context.Comments.Any(e => e.Id == id);
        }
    }
}