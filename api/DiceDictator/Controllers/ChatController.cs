using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using DiceDictator.Services;
using DiceDictator.Models;
using Microsoft.Extensions.Logging;

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
        private readonly ILogger<ChatController> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="ChatController"/> class.
        /// </summary>
        /// <param name="orqAiService">The service for communicating with ORQ.AI.</param>
        /// <param name="logger">The logger instance.</param>
        public ChatController(IOrqAiService orqAiService, ILogger<ChatController> logger)
        {
            _orqAiService = orqAiService;
            _logger = logger;
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
            // Log user information
            if (request.User != null)
            {
                _logger.LogInformation(
                    "Chat request received from user {UserName} ({UserEmail}) via {Provider}. Message: {Message}",
                    request.User.Name,
                    request.User.Email,
                    request.User.Provider,
                    request.Message
                );
            }
            else
            {
                _logger.LogInformation("Chat request received from anonymous user. Message: {Message}", request.Message);
            }

            try
            {
                var orqAiResponse = await _orqAiService.SendMessageAsync(request.Message, request.ConversationHistory);
                _logger.LogInformation("Successfully received response from ORQ.AI for message: {Message}", request.Message);
                return Content(orqAiResponse, "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing chat request for message: {Message}", request.Message);
                return StatusCode(500, "An error occurred while processing your request.");
            }
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

        /// <summary>
        /// The user information from the frontend.
        /// </summary>
        public User User { get; set; }
    }
} 