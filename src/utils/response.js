export const successResponse = (res, statusCode = 200, message = "Success", data = null) => {
  const response = {
    success: true,
    statusCode,
    message,
  };
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};

export const errorResponse = (res, statusCode = 500, message = "Internal Server Error") => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};
