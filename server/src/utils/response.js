/**
 * Standardized API Response Builder
 * Menjamin konsistensi format JSON di seluruh aplikasi.
 */

const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, error = null) => {
    // Di production, kita bisa menyembunyikan detail error asli agar tidak bocor
    const response = {
        success: false,
        message
    };

    if (error && process.env.NODE_ENV === 'development') {
        response.debug = error.message || error;
    }

    return res.status(statusCode).json(response);
};

module.exports = { successResponse, errorResponse };