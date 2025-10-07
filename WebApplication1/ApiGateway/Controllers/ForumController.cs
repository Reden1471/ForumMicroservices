using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace ApiGateway.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ForumController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public ForumController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        // Auth endpoints
        [HttpPost("auth/register")]
        public async Task<IActionResult> Register([FromBody] object registerData)
        {
            var client = _httpClientFactory.CreateClient("AuthService");
            var response = await client.PostAsync("/api/Auth/register",
                new StringContent(registerData.ToString(), Encoding.UTF8, "application/json"));

            var content = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, content);
        }

        [HttpPost("auth/login")]
        public async Task<IActionResult> Login([FromBody] object loginData)
        {
            var client = _httpClientFactory.CreateClient("AuthService");
            var response = await client.PostAsync("/api/Auth/login",
                new StringContent(loginData.ToString(), Encoding.UTF8, "application/json"));

            var content = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, content);
        }

        // Posts endpoints
        [HttpGet("posts")]
        public async Task<IActionResult> GetPosts()
        {
            var client = _httpClientFactory.CreateClient("PostService");
            var response = await client.GetAsync("/api/Posts");

            var content = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, content);
        }

        [HttpGet("posts/{id}")]
        public async Task<IActionResult> GetPost(int id)
        {
            var client = _httpClientFactory.CreateClient("PostService");
            var response = await client.GetAsync($"/api/Posts/{id}");

            var content = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, content);
        }

        // Comments endpoints
        [HttpGet("comments/post/{postId}")]
        public async Task<IActionResult> GetCommentsByPost(int postId)
        {
            var client = _httpClientFactory.CreateClient("CommentService");
            var response = await client.GetAsync($"/api/Comments/post/{postId}");

            var content = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, content);
        }
    }
}