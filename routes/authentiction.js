const express = require("express")
const router = express.Router()
const { check } = require("express-validator")
const { signout,signup ,signin, isSignedIn} = require("../controllers/authentication")

router.post("/signup",[
    check("name")
        .isLength({min: 3 })
        .withMessage('Name should be atleast 3 characters long'),
    check("email")
        .isEmail()
        .withMessage("Email is required"),
    check("password")
        .isLength({min: 8})
        .withMessage("Password should be 8 characters long")
],signup)



router.post("/signin",[
    check("email")
        .isEmail()
        .withMessage("Email is required"),
    check("password")
        .isLength({min: 1})
        .withMessage("Password is required")
],signin)


router.get("/signout",signout)
router.get("/test", isSignedIn, (req,res) => {
    res.json(req.auth)
})

module.exports = router;
