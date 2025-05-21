using DiceDictator.Controllers;
using DiceDictator.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Threading.Tasks;
using Xunit;

namespace DiceDictator.Tests
{
    public class ChatControllerTests
    {
        [Fact]
        public async Task Post_ShouldReturnContentResultWithOrqAiResponse_WhenValidRequest()
        {
            // Arrange
            var expectedResponse = "{\"result\":\"haiku\"}";
            var orqAiServiceMock = new Mock<IOrqAiService>();
            orqAiServiceMock.Setup(s => s.SendMessageAsync(It.IsAny<string>())).ReturnsAsync(expectedResponse);

            var controller = new ChatController(orqAiServiceMock.Object);
            var request = new ChatMessageRequest { Message = "ducks" };

            // Act
            var result = await controller.Post(request);

            // Assert
            var contentResult = Assert.IsType<ContentResult>(result);
            Assert.Equal("application/json", contentResult.ContentType);
            Assert.Equal(expectedResponse, contentResult.Content);
        }
    }
}
