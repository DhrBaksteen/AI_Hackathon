using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using DiceDictator.Services;

namespace DiceDictator.Controllers
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
        /// Accepts a chat message and conversation history and forwards it to ORQ.AI, returning the AI's response.
        /// </summary>
        /// <param name="request">The chat message request containing the user's message and conversation history.</param>
        /// <returns>The response from ORQ.AI as JSON.</returns>
        [HttpPost]
        [Route("/chat")]
        public async Task<IActionResult> Post([FromBody] ChatMessageRequest request)
        {
            var orqAiResponse = await _orqAiService.SendMessageAsync(request.Message, request.ConversationHistory);
            return Content(orqAiResponse, "application/json");
        }
    }

    /// <summary>
    /// Represents a message in the conversation history.
    /// </summary>
    public class ConversationMessage
    {
        /// <summary>
        /// The content of the message.
        /// </summary>
        public string Content { get; set; }

        /// <summary>
        /// The role of the message sender (user or assistant).
        /// </summary>
        public string Role { get; set; }
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

        /// <summary>
        /// The conversation history including both user and AI messages.
        /// </summary>
        public List<ConversationMessage> ConversationHistory { get; set; }
    }
} 