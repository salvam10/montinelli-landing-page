const nodemailer = require("nodemailer");
const logoUrl =
  "https://firebasestorage.googleapis.com/v0/b/kontevo-88b07.appspot.com/o/kontevo-logo-nuevo.png?alt=media&token=5c91aab8-5c9e-4466-9994-6731b6324264";

const sendEmail = async (option) => {
  //CREATE TRANSPORTER
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //DEFINE EMAIL OPTIONS
  const emailOptions = {
    from: `Kontevo ${process.env.EMAIL_USER}`,
    to: option.email,
    subject: option.subject,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #C5C5C5; border-radius: 10px; background-color: #ffffff;">
      <div style="text-align: center; padding: 10px 0; border-radius: 10px 10px 0 0;">
        <img src="${logoUrl}" alt="Kontevo Logo" style="height: 60px;" /> 
      </div>
      <div style="padding: 20px; background-color: #ffffff;">
        <h2 style="color: #000066; text-align: center;">Restablecer tu contraseña</h2>
        <p style="font-size: 16px; color: #333;">Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para restablecer tu contraseña:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${option.resetUrl}" style="padding: 12px 25px; background-color: #66CC33; color: #ffffff; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Restablecer Contraseña</a>
        </div>
        <p style="font-size: 14px; color: #666;">Este enlace para restablecer la contraseña será válido solo por 10 minutos.</p>
      </div>
      <div style="background-color: #FF9933; padding: 10px; border-radius: 0 0 10px 10px; text-align: center; color: #ffffff;">
        <p style="margin: 0; font-size: 12px;">Si no solicitaste este cambio, ignora este correo.</p>
        <p style="margin: 0; font-size: 12px;">© 2024 Kontevo. Todos los derechos reservados.</p>
      </div>
    </div>
  `,
  };
  const result = await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
