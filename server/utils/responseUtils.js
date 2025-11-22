class SuccessResponse {
  constructor(data, message = 'Thành công', code = 200) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

class PaginatedResponse {
  constructor(data, page, pageSize, totalItems, totalPages, message = 'Thành công', code = 200) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.pagination = { page, pageSize, totalItems, totalPages };
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationResponse {
  constructor(errors, message = 'Dữ liệu không hợp lệ', code = 400) {
    this.success = false;
    this.message = message;
    this.errors = errors;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    console.log("ErrorResponse created with message:", message, "and statusCode:", statusCode);
    this.message = message;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
  toJSON() {
    return {
      success: false,
      message: this.message,
      statusCode: this.statusCode,
      isOperational: this.isOperational
    };
  }
}

module.exports = {
  SuccessResponse,
  PaginatedResponse,
  ValidationResponse,
  ErrorResponse
};