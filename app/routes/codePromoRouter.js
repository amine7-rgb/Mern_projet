const router = require('express').Router()
const CodePctrl = require('../Controllers/codepromocontroller')

router.route('/code')
    .get(CodePctrl.getpromo)
    .post(CodePctrl.createpromo)
router.get('/verifyCode/:promoCode', CodePctrl.verifyCode)
router.delete('/codepromo/:id', CodePctrl.deleteCodePromo )

module.exports = router