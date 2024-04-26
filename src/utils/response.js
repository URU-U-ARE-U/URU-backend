function formatResponse(data, message = "Success") {
  return { success: true, message, data };
}

function formatError(message = "Error occurred") {
  return { success: false, message };
}

export { formatError, formatResponse };
