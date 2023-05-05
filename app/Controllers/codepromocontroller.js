const CodePromo = require('../models/Promocode')
// Filter, sorting and paginating
const twilio = require('twilio');
const accountSid = 'AC738d1d8f34b4be61e4e94fa502249a6d';
const authToken = 'a730c99a2800635020382b7a84d66b43';
const client = new twilio(accountSid, authToken);
function sendSMS(code,discount,expirationDate) {
    client.messages
      .create({
        body: `Agricom A new codePromo has been added in our platform : ${code}\n with a :${discount} %. expiration date is ${expirationDate} `,
        from: '+16073262192',
        to: '+21658126757'
      })
      .then(message => console.log(message.sid))
      .catch(error => console.error(error));
  }
const CodePctrl= {
    getpromo: async(req, res) =>{
        try {
            const code = await CodePromo.find()
            res.json(code)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    createpromo: async (req, res) =>{
        const { code, discount, expirationDate } = req.body;

        try {
          const promoCode = new CodePromo({ code, discount, expirationDate });
          await promoCode.save();
        //   sendSMS(code,discount,expirationDate);
          res.status(201).json(promoCode);
        } catch (err) {
          res.status(400).json({ message: err.message });
        }
    }

 ,verifyCode: async (req, res) => {
    const { promoCode } = req.params;

    try {
      const code = await CodePromo.findOne({ code: promoCode });

      if (!code) {
        return res.status(404).json({ message: "Invalid Code." });
      }

      if (new Date() > code.expirationDate) {
        return res.status(400).json({ message: "Code Expired" });
      }

      return res.status(200).json({ discount: code.discount });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  deleteCodePromo : async (req, res) => {
    try {
      const codePromo = await CodePromo.findByIdAndDelete(req.params.id);
      if (!codePromo) {
        return res.status(404).send({ msg: 'Code promo not found' });
      }
      res.send({ msg: 'Code promo deleted successfully' });
    } catch (err) {
      res.status(500).send({ msg: err.message });
    }
  }

}


module.exports = CodePctrl