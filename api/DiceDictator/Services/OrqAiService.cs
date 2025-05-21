using System.Threading.Tasks;

namespace DiceDictator.Services
{
    /// <summary>
    /// Interface for a service that communicates with ORQ.AI.
    /// </summary>
    public interface IOrqAiService
    {
        /// <summary>
        /// Sends a message to ORQ.AI and returns the response as a string.
        /// </summary>
        /// <param name="message">The user's chat message.</param>
        /// <returns>The response from ORQ.AI as a JSON string.</returns>
        Task<string> SendMessageAsync(string message);
    }

    /// <summary>
    /// Placeholder implementation of IOrqAiService.
    /// </summary>
    public class OrqAiService : IOrqAiService
    {
        public Task<string> SendMessageAsync(string message)
        {
            throw new System.NotImplementedException();
        }
    }
} 