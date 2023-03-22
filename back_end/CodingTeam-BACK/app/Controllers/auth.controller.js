
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const code=''
const mongoose = require('mongoose');




let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: "springbootanulattest@gmail.com",
    pass: "hskaznjsxgopqrsw",
  },
});

// function isEncryptedPassword(password,password1) {
//   // Check if the password is a string
//   if (typeof password !== 'string') {
//     return false;
//   }

//   // Check if the password has the correct format for a bcrypt hash
//   const bcryptRegex = /^\$2[ayb]\$.{56}$/;
//   if (!bcryptRegex.test(password)) {
//     return false;
//   }

//   // Compare the password with a known bcrypt hash
//  // const knownHash = '$2a$10$1vYjk9XyJBY4oKcWV7nRn.u1uZ7Jh8upGpR5h0K0DKzOJjK3qit.q';
//    const knownHash = password1;

//   return bcrypt.compareSync(knownHash, password);
// }
function isEncryptedPassword(password) {
  // Check if the password is a string
  if (typeof password !== 'string') {
    return false;
  }

  // Check if the password has the correct format for a bcrypt hash
  const bcryptRegex = /^\$2[ayb]\$.{56}$/;
  if (!bcryptRegex.test(password)) {
    return false;
  }

  return true;
}


exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username,
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      if(user.isVerified==false){
        return res.status(401).send({message : "Please verify your Acount"})
      } else{
      if (isEncryptedPassword(req.body.password) &&req.body.password ==user.password){
        var passwordIsValid=true
      }else{
      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    }
      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400, // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        photo:user.photo,
        roles: authorities,
        accessToken: token,
      });
    }
    });
};


exports.resetPassword = (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return res.status(500).send({ message: err });
    }

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    // Generate a random token for reset password
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const randomNumber = Math.floor(Math.random() * 1000000) + 1;
     this.code=randomNumber.toString()
    // Set reset password token and expiry date
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    user.save((err) => {
      if (err) {
        return res.status(500).send({ message: err });
      }

      // Send email with reset password link
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${token}`;
      const mailOptions = {
        to: user.email,
        from: 'springbootanulattest@gmail.com',
        subject: 'Reset your password',
        text: `Hi ${user.username},\n\nYou are receiving this email because you have requested to reset your password. Please click on the following link or paste it into your browser to reset your password:\n\n${randomNumber}\n\nThis link will expire in one hour.\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        res.status(200).send(token);
      });
    });
  });
}

exports.gettoken = (req, res) => {
  console.log("Token parameter in request:", req.params.token);
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  }, (err, user) => {
    if (err) {
      console.error("Error finding user:", err);
      return res.status(500).send({ message: err });
    }

    if (!user) {
      console.log("Invalid or expired token:", req.params.token);
      return res.status(400).send({ message: 'Password reset token is invalid or has expired.' });
    }

    console.log("User found with token:", req.params.token);
    res.status(200).send({username: user.username });
  });
};
exports.posttoken = (req, res) => {
  
  if(this.code==req.body.code){
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  }, (err, user) => {
    if (err) {
      return res.status(500).send({ message: err });
    }
   

    if (!user) {
      return res.status(400).send({ message: 'Password reset token is invalid or has expired.' });
    }

    user.password = bcrypt.hashSync(req.body.password, 8);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    user.save((err) => {
      if (err) {
        return res.status(500).send({ message: err });
      }

      
      const mailOptions = {
        to: user.email,
        from: 'springbootanulattest@gmail.com',
        subject: 'Your password has been changed',
        text: `Hi ${user.username},\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        res.status(200).send({ message: 'Your password has been updated.' });
      });
    });
  });
}else{
  res.status(400).send("Code Non Valide")
}
}


exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    photo: req.files?.photo === undefined ? '' : (req.files?.photo[0].path).replace('\\', '/'),
    isVerified: false,
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles }
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map(role => role._id);
          user.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            // Send verification email to the user's email address
            const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email/${user._id}`;

            const mailOptions = {
              to: user.email,
              from: 'springbootanulattest@gmail.com',
              subject: 'Verify your email address',
              html: `<p>Hi ${user.username},</p><p>Please click on the following link or paste it into your browser to verify your email address:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>This link will expire in 24 hours.</p><p>If you did not create an account with us, please ignore this email.</p>`
            };

            transporter.sendMail(mailOptions, (err) => {
              if (err) {
                return res.status(500).send({ message: err });
              }

              res.send({ message: "User was registered successfully. Please check your email to verify your account." });
            });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          // Send verification email to the user's email address
          const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email/${user._id}`;

          const mailOptions = {
            to: user.email,
            from: 'springbootanulattest@gmail.com',
            subject: 'Verify your email address',
            html: `<p>Hi ${user.username},</p><p>Please click on the following link or paste it into your browser to verify your email address:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>This link will expire in 24 hours.</p><p>If you did not create an account with us, please ignore this email.</p>`
          };

          transporter.sendMail(mailOptions, (err) => {
            if (err) {
              return res.status(500).send({ message: err });
            }

            res.send({ message: "User was registered successfully. Please check your email to verify your account." });
          });
        });
      });
    }
  });
};

exports.verifyEmail = (req, res) => {
  const userId = req.params.id;

  // Check if the user ID is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID' });
    
  }

  User.findById(userId, (err, user) => {
    if (err) {
      return res.status(500).send({ message: err });
    }
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).send({ message: 'Email address already verified' });
    }
    user.isVerified = true;
    user.save((err) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
      res.send({ message: 'Email address verified successfully' });
    });
  });
};

exports.updateUserById = async (req, res) => {
  try {
    await User.findByIdAndUpdate({ _id: req.params.id }, req.body).exec();

    res.status(200).json({
      success: true,
      message: 'Updated Successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const foundUsers = await User.find().exec();

    if (foundUsers) {
      res.status(200).json({
        success: true,
        user: foundUsers,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({
      _id: req.params.id,
    });

    if (deletedUser) {
      res.status(200).json({
        success: true,
        message: `L'utilisateur a été supprimées avec succès`,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).exec();

    if (user) {
      res.status(200).json({
        success: true,
        user: user,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.bannedUser= async(req,res)=>{

    const user = await User.findOne({ _id: req.params.id }).exec();

   
      user.isVerified=false
      user.save()
      res.status(200).send("user banned")
      const mailOptions = {
        to: user.email,
        from: 'springbootanulattest@gmail.com',
        subject: 'YOUR ACCOUNT HAS BEEN BANNED !',
        html: `<p>Hi ${user.username},</p><p>Your account has been banned</p><p>For more details please contact us.</p>`
      };
      
          transporter.sendMail(mailOptions, (err) => {
            if (err) {
              return res.status(500).send({ message: err });
            }
      
            res.send({ message: "User was registered successfully. Please check your email to verify your account." });
          });
}
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).exec();

    user.isVerified = true; // set isVerified to true to unban the user
    await user.save(); // save the user changes to the database

    const mailOptions = {
      to: user.email,
      from: 'springbootanulattest@gmail.com',
      subject: 'YOUR ACCOUNT HAS BEEN UNBANNED !',
      html: `<p>Hi ${user.username},</p><p>Your account has been unbanned</p><p>For more details please contact us.</p>`
    };

    // send the unbanned user an email notification
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.status(500).send({ message: err });
      }

      res.status(200).send("User has been unbanned");
    });
  } catch (err) {
    res.status(500).send({ message: err });
  }
};
