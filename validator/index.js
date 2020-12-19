const {check,validationResult} = require('express-validator');

exports.userSignUpValidator = [
    check('name').not().isEmpty().withMessage('Name cannot be empty')
                 .isLength({min:2}).withMessage('Name has to be greater than 2 characters'),
    check('email').isEmail().withMessage("Invalid Email"),
    check('password').not().isEmpty().withMessage('Password cannot be empty')
                     .isLength({ min:6 }).withMessage('Password must be atleast 6 characters long')
                     .matches(/\d/).withMessage('password must contain a number')
]
