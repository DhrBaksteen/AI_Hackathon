using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using JoystickJudge.Services;

namespace JoystickJudge.Controllers
{
    /// <summary>
    /// Controller for handling chat messages and forwarding them to ORQ.AI.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IOrqAiService _orqAiService;

        /// <summary>
        /// Initializes a new instance of the <see cref="ChatController"/> class.
        /// </summary>
        /// <param name="orqAiService">The service for communicating with ORQ.AI.</param>
        public ChatController(IOrqAiService orqAiService)
        {
            _orqAiService = orqAiService;
        }

        /// <summary>
        /// Accepts a chat message and forwards it to ORQ.AI, returning the AI's response.
        /// </summary>
        /// <param name="request">The chat message request containing the user's message.</param>
        /// <returns>The response from ORQ.AI as JSON.</returns>
        [HttpPost]
        [Route("/chat")]
        public async Task<IActionResult> Post([FromBody] ChatMessageRequest request)
        {
            var orqAiResponse = await _orqAiService.SendMessageAsync(request.Message);
            return Content(orqAiResponse, "application/json");
        }
    }

    /// <summary>
    /// Represents a chat message request from the frontend.
    /// </summary>
    public class ChatMessageRequest
    {
        /// <summary>
        /// The user's chat message to be sent to ORQ.AI.
        /// </summary>
        public string Message { get; set; }
    }
} 