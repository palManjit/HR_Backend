class ApiResponse {
  constructor(statusCode, message = "Something went wrong", data = []) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;
