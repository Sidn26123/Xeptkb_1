const { validationResult } = require('express-validator');
const {ValidationResponse} = require("../utils/responseUtils");

exports.validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        const extractedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));
        return res.status(400).json(new ValidationResponse(extractedErrors, 'Dữ liệu không hợp lệ', 400 ));
    }
    next();
};
