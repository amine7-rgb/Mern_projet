const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const Product = require("../models/productModel")

const Facture = require("../models/facture.js")
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const code = "";
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const moment =  require("moment")
const Quote = require("../models/quote.js")
const logoPath = path.join(__dirname, '..', 'routes', 'logoagri.png');
const Products = require('../models/productModel.js')

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "springbootanulattest@gmail.com",
    pass: "esamlpkqkacltnta",
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: "SSLv3",
  },
});
function isEncryptedPassword(password) {
  // Check if the password is a string
  if (typeof password !== "string") {
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
      if (user.isVerified == false) {
        return res.status(401).send({ message: "Please verify your Acount" });
      } else {
        if (
          isEncryptedPassword(req.body.password) &&
          req.body.password == user.password
        ) {
          var passwordIsValid = true;
        } else {
          var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
          );
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
          cin: user.cin,
          email: user.email,
          photo: user.photo,
          age: user.age,
          sexe: user.sexe,
          numtel: user.numtel,
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
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const randomNumber = Math.floor(Math.random() * 1000000) + 1;
    this.code = randomNumber.toString();
    // Set reset password token and expiry date
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    user.save((err) => {
      if (err) {
        return res.status(500).send({ message: err });
      }

      // Send email with reset password link
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/reset-password/${token}`;
      const mailOptions = {
        to: user.email,
        from: "springbootanulattest@gmail.com",
        subject: "Reset your password",
        text: `Hi ${user.username},\n\nYou are receiving this email because you have requested to reset your password. Please click on the following link or paste it into your browser to reset your password:\n\n${randomNumber}\n\nThis link will expire in one hour.\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };
      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        res.status(200).send(token);
      });
    });
  });
};


exports.facture = async (req, res) => {
  try {
    const template = fs.readFileSync(
      path.resolve("./app/views", "facture.html"),
      {
        encoding: "utf-8",
      }
    );
    const today = new Date();
    const html = ejs.render(template, {
      name: req.body.order.name,
      address: req.body.order.address,
      orderId: "#5555555555",
      items: req.body.order.items,
      total: req.body.order.total,
      today: moment(today).format("YYYY-MM-DD HH:mm:ss"),
      order: req.body.order,
    });

    // Save Facture to database
    const facture = new Facture({
      name: req.body.order.name,
      lastName: req.body.order.lastName,
      email: req.body.order.email,
      phone: req.body.order.phone,
      address: req.body.order.address,
      country: req.body.order.country,
      zipCode: req.body.order.zipCode,
      notes: req.body.order.notes,
      items: req.body.order.items,
    });
    await facture.save();

    // Send email with invoice
    let info = await transporter.sendMail({
      from: "springbootanulattest@gmail.com",
      to: req.body.order.email,
      subject: "Facture",
      html: html,
    });

    // Send response
    res.json({ message: "done" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server err" });
  }
};

// exports.facture = async (req, res) => {
//   try {
//     const template = fs.readFileSync(
//       path.resolve("./app/views", "facture.html"),
//       {
//         encoding: "utf-8",
//       }
//     );
//     console.log(req.body.order.items)
//     console.log(req.body.order)
//     const today = new Date()
//     const html = ejs.render(template, {
//       name: req.body.order.name,
//       address: req.body.order.address,
//       orderId: "#5555555555",
//       items : req.body.order.items,
//       total : req.body.order.total,
//       today :  moment(today).format("YYYY-MM-DD HH:mm:ss"),
//       order : req.body.order
//     });

//     let info = await transporter.sendMail({
//       from: "springbootanulattest@gmail.com",
//       to: req.body.order.email,
//       subject: "Facture",
//       html: html,
//     });
//     // 4. send respone
//     res.json({ message: "done" });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "internal server err" });
//   }
// };

exports.sendEmail = (req, res) => {
  const { email, subject, message, name } = req.body;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "springbootanulattest@gmail.com",
      pass: "esamlpkqkacltnta",
    },
  });

  // send mail with defined transport object
  let mailOptions = {
    from: email,
    to: "springbootanulattest@gmail.com",
    subject: subject,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res
        .status(500)
        .send({ message: "An error occurred while sending the email" });
    } else {
      console.log("Message sent: %s", info.messageId);
      res.status(200).send({ message: "Email sent successfully" });
    }
  });
};

// exports.resetPassword = (req, res) => {
//   User.findOne({ email: req.body.email }, (err, user) => {
//     if (err) {
//       return res.status(500).send({ message: err });
//     }

//     if (!user) {
//       return res.status(404).send({ message: "User Not found." });
//     }

//     // Generate a random token for reset password
//     const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
//     const randomNumber = Math.floor(Math.random() * 1000000) + 1;
//     this.code = randomNumber.toString();

//     // Set reset password token and expiry date
//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

//     user.save((err) => {
//       if (err) {
//         return res.status(500).send({ message: err });
//       }

//       // Send email with reset password link
//       const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${token}`;
//       const mailOptions = {
//         to: user.email,
//         from: 'springbootanulattest@gmail.com',
//         subject: 'Reset your password',
//         text: `Hi ${user.username},\n\nYou are receiving this email because you have requested to reset your password. Please click on the following link or paste it into your browser to reset your password:\n\n${randomNumber}\n\nThis link will expire in one hour.\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
//       };
//       transporter.sendMail(mailOptions, (err) => {
//         if (err) {
//           return res.status(500).send({ message: err });
//         }

//         // Email sent successfully, send success response with message
//         res.status(200).send({ message: "Password reset link sent successfully." });
//       });
//     });
//   });
// }

exports.addadmin = (req, res) => {
  // Find the "admin" role object
  Role.findOne({ name: "admin" }, (err, role) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    // Create the new user with the "admin" role
    const user = new User({
      cin: req.body.cin,
      username: req.body.username,
      email: req.body.email,
      age: req.body.age,
      sexe: req.body.sexe,
      numtel: req.body.numtel,
      password: bcrypt.hashSync(req.body.password, 8),
      photo:
        req.files?.photo === undefined
          ? ""
          : (req.files?.photo[0].path).replace("\\", "/"),
      isVerified: false,
      roles: [role._id],
    });

    user.save((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      // Send verification email to the user's email address
      const verificationUrl = `${req.protocol}://${req.get(
        "host"
      )}/verify-email/${user._id}`;

      const mailOptions = {
        to: user.email,
        from: "springbootanulattest@gmail.com",
        subject: "Verify your email address",
        html: `<p>Hi ${user.username},</p><p>Please click on the following link or paste it into your browser to verify your email address:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>This link will expire in 24 hours.</p><p>If you did not create an account with us, please ignore this email.</p>`,
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          return res.status(500).send({ message: err });
        }

        res.send({
          message:
            "Admin user was registered successfully. Please check your email to verify your account.",
        });
      });
    });
  });
};

exports.gettoken = (req, res) => {
  console.log("Token parameter in request:", req.params.token);
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    (err, user) => {
      if (err) {
        console.error("Error finding user:", err);
        return res.status(500).send({ message: err });
      }

      if (!user) {
        console.log("Invalid or expired token:", req.params.token);
        return res
          .status(400)
          .send({ message: "Password reset token is invalid or has expired." });
      }

      console.log("User found with token:", req.params.token);
      res.status(200).send({ username: user.username });
    }
  );
};
exports.posttoken = (req, res) => {
  if (this.code == req.body.code) {
    User.findOne(
      {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
      },
      (err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }

        if (!user) {
          return res
            .status(400)
            .send({
              message: "Password reset token is invalid or has expired.",
            });
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
            from: "springbootanulattest@gmail.com",
            subject: "Your password has been changed",
            text: `Hi ${user.username},\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
          };
          transporter.sendMail(mailOptions, (err) => {
            if (err) {
              return res.status(500).send({ message: err });
            }
            res
              .status(200)
              .send({ message: "Your password has been updated." });
          });
        });
      }
    );
  } else {
    res.status(400).send({ message: "Invalid Code ! " });
  }
};

exports.signup = (req, res) => {
  const user = new User({
    cin: req.body.cin,
    username: req.body.username,
    email: req.body.email,
    age: req.body.age,
    sexe: req.body.sexe,
    numtel: req.body.numtel,
    password: bcrypt.hashSync(req.body.password, 8),
    photo:
      req.files?.photo === undefined
        ? ""
        : (req.files?.photo[0].path).replace("\\", "/"),
    // photo: req.files && req.files.photo ? req.files.photo[0].path.replace('\\', '/') : '',

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
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            // Send verification email to the user's email address
            const verificationUrl = `${req.protocol}://${req.get(
              "host"
            )}/verify-email/${user._id}`;

            const mailOptions = {
              to: user.email,
              from: "springbootanulattest@gmail.com",
              subject: "Verify your email address",
              html: `<p>Hi ${user.username},</p><p>Please click on the following link or paste it into your browser to verify your email address:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>This link will expire in 24 hours.</p><p>If you did not create an account with us, please ignore this email.</p>`,
            };

            transporter.sendMail(mailOptions, (err) => {
              if (err) {
                return res.status(500).send({ message: err });
              }

              res.send({
                message:
                  "User was registered successfully. Please check your email to verify your account.",
              });
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
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          // Send verification email to the user's email address
          const verificationUrl = `${req.protocol}://${req.get(
            "host"
          )}/verify-email/${user._id}`;

          const mailOptions = {
            to: user.email,
            from: "springbootanulattest@gmail.com",
            subject: "Verify your email address",
            html: `<p>Hi ${user.username},</p><p>Please click on the following link or paste it into your browser to verify your email address:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>This link will expire in 24 hours.</p><p>If you did not create an account with us, please ignore this email.</p>`,
          };

          transporter.sendMail(mailOptions, (err) => {
            if (err) {
              return res.status(500).send({ message: err });
            }

            res.send({
              message:
                "User was registered successfully. Please check your email to verify your account.",
            });
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
    return res.status(400).send({ message: "Invalid user ID" });
  }

  User.findById(userId, (err, user) => {
    if (err) {
      return res.status(500).send({ message: err });
    }
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    if (user.isVerified) {
      return res
        .status(400)
        .send({ message: "Email address already verified" });
    }
    user.isVerified = true;
    user.save((err) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
      res.send({ message: "Email address verified successfully" });
    });
  });
};

exports.updateUserById = async (req, res) => {
  try {
    await User.findByIdAndUpdate({ _id: req.params.id }, req.body).exec();

    res.status(200).json({
      success: true,
      message: "Updated Successfully",
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
exports.getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).exec();

    if (user) {
      res.status(200).json({
        success: true,
        user: user,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




exports.bannedUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).exec();

  user.isVerified = false;
  user.save();
  res.status(200).send("user banned");
  const mailOptions = {
    to: user.email,
    from: "springbootanulattest@gmail.com",
    subject: "YOUR ACCOUNT HAS BEEN BANNED !",
    html: `<p>Hi ${user.username},</p><p>Your account has been banned</p><p>For more details please contact us.</p>`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return res.status(500).send({ message: err });
    }

    res.send({
      message:
        "User was registered successfully. Please check your email to verify your account.",
    });
  });
};
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).exec();

    user.isVerified = true; // set isVerified to true to unban the user
    await user.save(); // save the user changes to the database

    const mailOptions = {
      to: user.email,
      from: "springbootanulattest@gmail.com",
      subject: "YOUR ACCOUNT HAS BEEN UNBANNED !",
      html: `<p>Hi ${user.username},</p><p>Your account has been unbanned</p><p>For more details please contact us.</p>`,
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
exports.updateUserById = async (req, res) => {
  try {
    await User.findByIdAndUpdate({ _id: req.params.id }, req.body).exec();

    res.status(200).json({
      success: true,
      message: "Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// const PDFDocument = require('pdfkit');
const blobStream = require('blob-stream');
const canvas = require('canvas');
//const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

const PDFDocument = require('pdfkit');
const quote = require("../models/quote");
exports.createQuote = async (req, res) => {
  try {
    // Get the data from the request body
    const { name, email, product, groundSurface } = req.body;

    // Check if the ground surface is provided
    if (!groundSurface) {
      return res.status(400).send('Ground surface is required');
    }

    // Calculate the number of sensors and smoke detectors needed based on the ground surface
    const sensorsNeeded = Math.ceil(groundSurface / 1000) * 4;
    const smokeDetectorsNeeded = Math.ceil(groundSurface / 1000);

    // Calculate the price based on the sensors and smoke detectors needed
    const sensorsPrice = sensorsNeeded * 28;
    const smokeDetectorsPrice = smokeDetectorsNeeded * 19;

    // Calculate the price of cables needed for sensors and smoke detectors
    const cablesPrice = (sensorsNeeded + smokeDetectorsNeeded) * 2  * 8;

    // Calculate the total price
    const totalPrice = sensorsPrice + smokeDetectorsPrice + cablesPrice;

    // Create a new quote object using the Quote model
    const quote = new Quote({
      name,
      email,
      product,
      sensorsNeeded,
      smokeDetectorsNeeded,
      sensorsPrice,
      smokeDetectorsPrice,
      cablesPrice,
      totalPrice,
      groundSurface,
    });

    // Save the quote to the database
    await quote.save();

   
    const fs = require('fs');
    const pdfMake = require('pdfmake/build/pdfmake.js');
    const pdfFonts = require('pdfmake/build/vfs_fonts.js');
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    // const imageBuffer = fs.readFileSync('app/routes/logoagri.png');

    const docDefinition = {
      content: [
        // {
        //   image: imageBuffer,
        //   width: 200,
        //   alignment: 'center',
        // },
        { text: 'Quote Information', style: 'header' },
        {
          table: {
            body: [
              [{ text: 'Product:', color: 'green' }, { text: product }],
              [{ text: 'Ground Surface:', color: 'green' }, { text: `${groundSurface} m²` }],
              [{ text: 'Sensors Needed:', color: 'green' }, `${sensorsNeeded} ` ],
              [{ text: 'Smoke Detectors Needed:', color: 'green' }, `${smokeDetectorsNeeded} `],
              [{ text: 'Sensors Price:', color: 'green' }, `${sensorsPrice} $`],
              [{ text: 'Smoke Detectors Price:', color: 'green' }, `${smokeDetectorsPrice} $`],
              [{ text: 'Cables Price:', color: 'green' }, `${cablesPrice} $`],
              // [{ text: 'Total Price:', color: 'green' }, `${totalPrice} $`],
              [{ text: 'Total Price:', color: 'green', bold: true }, `${totalPrice} $`],
            ],
            widths: ['*', '*'],
          },
          fontSize: 14,
        },
      ],
      styles: {
        header: {
          fontSize: 20,
          alignment: 'center',
          color: 'red',
        },
      },
    };
    
    
    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBuffer((buffer) => {
      fs.writeFile('quote.pdf', buffer, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log('PDF file saved successfully');
        }
      });
    });
    



    // Send an email containing the quote information
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'springbootanulattest@gmail.com',
        pass: 'esamlpkqkacltnta',
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Quote Information',
      html: `
        <div>
        <img src="cid:logo@company.com" alt="Company Logo" style="display: block; margin-left: auto; margin-right: auto; width: 250px;">

        </div>
        <p>Hello ${name},</p>
        <p>Thank you for requesting a quote from our company. Here is the information you provided:</p>
        <ul>
          <li>Product: ${product}</li>
          <li>Ground Surface: ${groundSurface} m² </li>
          <li>Sensors Needed For ${groundSurface} m²: ${sensorsNeeded}</li>
          <li>Smoke Detectors Needed For ${groundSurface} m²: ${smokeDetectorsNeeded}</li>
          <li>Sensors Price: ${sensorsPrice}$</li>
          <li>Smoke Detectors Price: ${smokeDetectorsPrice}$</li>
          <li>Cables Price: ${cablesPrice}$</li>
          <li>Total Price: ${totalPrice}$</li>
        </ul>
        <p>Please let us know if you have any further questions or if you would like to proceed with this quote.</p>
        <p><span style="color: red;">Installation cost is included!</span></p>
        <p>Best regards,</p>
        <p>Agricom.</p>
      `,
      attachments: [    {      filename: 'quote.pdf',      content: fs.createReadStream('quote.pdf')    },    {      filename: 'logoagri.png',      path: logoPath,      cid: 'logo@company.com'    }  ]
    };
    

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('Email could not be sent');
      } else {
        console.log('Email sent: ' + info.response);
        // Send a success response without the attachment
        res.status(201).send(quote);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating quote');
  }
};
exports.countAllProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments().exec();

    res.status(200).json({
      success: true,
      count: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



exports.countAllUsers = async (req, res) => {
  try {
    const count = await User.countDocuments().exec();

    res.status(200).json({
      success: true,
      count: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.countAllQuote= async (req,res)=>{

try{
  const count = await Quote.countDocuments().exec();
  res.status(200).json({
    success: true,
    count: count,
  });
}
  catch{
    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
}
exports.countAllFacture= async (req,res)=>{

  try{
    const count = await Facture.countDocuments().exec();
    res.status(200).json({
      success: true,
      count: count,
    });
  }
    catch{
      res.status(500).json({
        success: false,
        message: error.message,
      });
  
    }
  }
 
  exports.calculateTotalPrice = async function(req, res) {
    try {
      const result = await Products.aggregate([
        {
          $group: {
            _id: null,
            totalPrice: { $sum: "$price" }
          }
        }
      ])
      res.status(200).json({
        success: true,
        totalPrice: result[0].totalPrice,
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        success: false,
        message: err.message,
      })
    }
  }
  


  // Function to calculate the Euclidean distance between two points
function calculateDistance(point1, point2) {
  const [x1, y1] = point1;
  const [x2, y2] = point2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Function to calculate the centroid of a cluster
function calculateCentroid(cluster) {
  const numPoints = cluster.length;
  if (numPoints === 0) {
    return null;
  }

  let sumX = 0;
  let sumY = 0;

  for (const point of cluster) {
    const [x, y] = point;
    sumX += x;
    sumY += y;
  }

  return [sumX / numPoints, sumY / numPoints];
}

// Function to perform the k-means clustering
function kMeansClustering(points, k) {
  // Initialize the centroids
  let centroids = points.slice(0, k);

  while (true) {
    // Assign points to the nearest centroid
    const clusters = Array.from({ length: k }, () => []);

    for (const point of points) {
      let minDistance = Infinity;
      let closestCentroid = null;

      for (const centroid of centroids) {
        const distance = calculateDistance(point, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = centroid;
        }
      }

      clusters[centroids.indexOf(closestCentroid)].push(point);
    }

    // Calculate new centroids
    const newCentroids = [];

    for (const cluster of clusters) {
      const centroid = calculateCentroid(cluster);
      if (centroid) {
        newCentroids.push(centroid);
      }
    }

    // Check if the centroids have converged
    if (JSON.stringify(newCentroids) === JSON.stringify(centroids)) {
      break;
    }

    centroids = newCentroids;
  }

  return centroids;
}
exports.kmeans = async(req,res)=>{
  const numTrees = req.body.numTrees;
  const treeDistance = req.body.treeDistance;
  const numSensors = req.body.numSensors;
  const gridSize = Math.ceil(Math.sqrt(numTrees)); // Taille de la grille arrondie à l'entier supérieur

  const treeCoordinates = [];

  // Calculer les coordonnées des arbres pour former une grille de carreaux avec la distance spécifiée
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = i * treeDistance;
      const y = j * treeDistance;
      const treeIndex = i * gridSize + j + 1;

      if (treeIndex <= numTrees) {
        treeCoordinates.push([x, y]);
      }
    }
  }

  const sensorCenters = kMeansClustering(treeCoordinates, numSensors);
  res.json({
    treeCoordinates: treeCoordinates,
    sensorCenters: sensorCenters
  });
 
// console.log(treeCoordinates);
};

// Define your API endpoint
