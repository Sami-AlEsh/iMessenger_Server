var express = require('express')
var router = express.Router();

//GET User Info
router.get('/:userId', (req, res) => {
 let userId = req.params['userId'];
 // TODO : Read user file
});

router.post('/login', (req, res) => {

});

router.post('/register', (req, res) => {

});

router.post('/forgetPass', (req, res) => {

});

router.get('/search/:username', (req, res) => {

});

module.exports = router;
