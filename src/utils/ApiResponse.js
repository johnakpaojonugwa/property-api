class ApiResponse {
  static success(data, message = 'Success', meta) {
    return {
      success: true,
      data,
      message,
      meta,
    };
  }

  static error(message = 'Request failed', errors = [], statusCode = 500) {
    return {
      success: false,
      message,
      errors,
      statusCode,
    };
  }
}

export default ApiResponse;
