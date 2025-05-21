using System.Threading.Tasks;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

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
    /// Implementation of IOrqAiService that calls the ORQ.AI API.
    /// </summary>
    public class OrqAiService : IOrqAiService
    {
        private readonly HttpClient _httpClient;
        private const string ApiUrl = "https://my.orq.ai/v2/deployments/invoke";
        private const string ApiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3b3Jrc3BhY2VJZCI6IjhmMzQ3MmY2LTRkNzAtNGE1NS04YTI1LWRlZmZiZGJhYjExYiIsImlzcyI6Im9ycSIsImlhdCI6MTc0NzgxMjQyNn0.VEsRPu-7cjVic5hhc_Ba8esSyymRKGPAb1g6exbZQfc";

        public OrqAiService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string> SendMessageAsync(string message)
        {
            var payload = new
            {
                key = "llm",
                context = new { environments = new string[] { } },
                messages = new object[]
                {
                    new { role = "system", content = "Your goal is to create awesome haikus" },
                    new { role = "user", content = message }
                },
                metadata = new { custom_field_name = "custom-metadata-value" }
            };

            var json = JsonSerializer.Serialize(payload);
            var request = new HttpRequestMessage(HttpMethod.Post, ApiUrl)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            request.Headers.Add("Authorization", $"Bearer {ApiKey}");
            request.Headers.Add("Accept", "application/json");

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var responseString = await response.Content.ReadAsStringAsync();

            // Parse the response and extract the assistant's message content
            try
            {
                var orqResponse = JsonSerializer.Deserialize<OrqAiResponse>(responseString);
                var content = orqResponse?.choices?.FirstOrDefault()?.message?.content;
                return content ?? "[No response from AI]";
            }
            catch
            {
                return "[Failed to parse AI response]";
            }
        }

        private class OrqAiResponse
        {
            public List<Choice> choices { get; set; }
        }
        private class Choice
        {
            public Message message { get; set; }
        }
        private class Message
        {
            public string content { get; set; }
        }
    }
} 