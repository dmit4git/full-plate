using WebApi.Helpers.Exceptions;

namespace WebApi.Tests.API.Helpers;

public class ActionExceptionSerializationTest
{
    [Test]
    public void ErrorSerializationTest()
    {
        // ActionError serialization
        var expectedError = new ActionError("ErrorCode");
        var errorJson = expectedError.ToJsonString();
        var actualError = ActionError.FromJsonString(errorJson);
        Assert.That(actualError, Is.EqualTo(expectedError));

        // ActionException serialization
        var errorCodes = new List<string> { "ErrorCode1", "ErrorCode2" };
        var expectedException = new ActionException(errorCodes);
        var exceptionJson = expectedException.ToJsonString();
        var actualException = ActionException.FromJsonString(exceptionJson);
        Assert.That(actualException, Is.EqualTo(expectedException));
    }
}
