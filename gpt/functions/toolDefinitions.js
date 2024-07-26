const toolDefinitions = [
    {
      type: "function",
      function: {
        name: "get_current_weather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
      },
    },

    {
      type: "function",
      function: {
        name: "square_number",
        description: "Square a number and return the result",
        parameters: {
          type: "object",
          properties: {
            number: {
              type: "number",
              description: "The number to square",
            },
          },
          required: ["number"],
        },
      },
    },
    
    {
      type: "function",
      function: {
        name: "get_name",
        description: "Get the name of the author of the message",
      },
    },
    
    {
      type: "function",
      function: {
        name: "get_user_info",
        description: "Get information about the author of the message in json format",
      },
    },
  ];

module.exports = toolDefinitions;