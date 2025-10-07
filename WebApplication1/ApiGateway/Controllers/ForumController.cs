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

        // POST: api/forum/posts
        [HttpPost("posts")]
        public async Task<IActionResult> CreatePost([FromBody] object postData)
        {
            var client = _httpClientFactory.CreateClient("PostService");

            // Authorization header átadása
            if (Request.Headers.ContainsKey("Authorization"))
            {
                var authHeader = Request.Headers["Authorization"].ToString();
                client.DefaultRequestHeaders.Add("Authorization", authHeader);
            }

            var response = await client.PostAsync("/api/Posts",
                new StringContent(postData.ToString(), Encoding.UTF8, "application/json"));

            var content = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, content);
        }

        // PUT: api/forum/posts/{id}
        [HttpPut("posts/{id}")]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] object postData)
        {
            var client = _httpClientFactory.CreateClient("PostService");

            // Authorization header átadása
            if (Request.Headers.ContainsKey("Authorization"))
            {
                var authHeader = Request.Headers["Authorization"].ToString();
                client.DefaultRequestHeaders.Add("Authorization", authHeader);
            }

            var response = await client.PutAsync($"/api/Posts/{id}",
                new StringContent(postData.ToString(), Encoding.UTF8, "application/json"));

            var content = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, content);
        }

        // DELETE: api/forum/posts/{id}
        [HttpDelete("posts/{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var client = _httpClientFactory.CreateClient("PostService");

            // Authorization header átadása
            if (Request.Headers.ContainsKey("Authorization"))
            {
                var authHeader = Request.Headers["Authorization"].ToString();
                client.DefaultRequestHeaders.Add("Authorization", authHeader);
            }

            var response = await client.DeleteAsync($"/api/Posts/{id}");

            if (response.StatusCode == System.Net.HttpStatusCode.NoContent)
            {
                return NoContent();
            }

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

        [HttpPost("comments")]
        public async Task<IActionResult> CreateComment([FromBody] object commentData)
        {
            var client = _httpClientFactory.CreateClient("CommentService");

            // Authorization header átadása
            if (Request.Headers.ContainsKey("Authorization"))
            {
                var authHeader = Request.Headers["Authorization"].ToString();
                client.DefaultRequestHeaders.Add("Authorization", authHeader);
            }

            var response = await client.PostAsync("/api/Comments",
                new StringContent(commentData.ToString(), Encoding.UTF8, "application/json"));

            var content = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, content);
        }

        [HttpPut("comments/{id}")]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] object commentData)
        {
            var client = _httpClientFactory.CreateClient("CommentService");

            if (Request.Headers.ContainsKey("Authorization"))
            {
                var authHeader = Request.Headers["Authorization"].ToString();
                client.DefaultRequestHeaders.Add("Authorization", authHeader);
            }

            var response = await client.PutAsync($"/api/Comments/{id}",
                new StringContent(commentData.ToString(), Encoding.UTF8, "application/json"));

            var content = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, content);
        }

        [HttpDelete("comments/{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var client = _httpClientFactory.CreateClient("CommentService");

            if (Request.Headers.ContainsKey("Authorization"))
            {
                var authHeader = Request.Headers["Authorization"].ToString();
                client.DefaultRequestHeaders.Add("Authorization", authHeader);
            }

            var response = await client.DeleteAsync($"/api/Comments/{id}");

            if (response.StatusCode == System.Net.HttpStatusCode.NoContent)
            {
                return NoContent();
            }

            var content = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, content);
        }

    }
}