const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const multer = require("multer");
const admin = require("firebase-admin");
const path = require("path");
const router = express.Router();
const postgresDB = require("../db/postgres");

// Configurar Firebase
const serviceAccount = require(path.resolve(process.env.FIREBASE_CREDENTIALS));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.BUCKET_NAME,
});
const bucket = admin.storage().bucket();

// Configurar Multer para manejar archivos
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para subir archivos
router.post("/upload/:clientId", upload.single("file"), async (req, res) => {
  const { clientId } = req.params;

  try {
    // Verificar que el cliente existe
    const clientCheck = await postgresDB.query(
      "SELECT * FROM clients WHERE id = $1",
      [clientId]
    );
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No se envió ningún archivo" });
    }

    const file = req.file;
    const fileName = `${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    stream.on("error", (err) => {
      console.error("Error subiendo el archivo:", err);
      res.status(500).json({ message: "Error subiendo el archivo" });
    });

    stream.on("finish", async () => {
      await fileUpload.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      // Actualizar la URL del archivo en la base de datos
      await postgresDB.query(
        "UPDATE clients SET rif_url = $1 WHERE id = $2 RETURNING *",
        [publicUrl, clientId]
      );

      res.status(200).json({ message: "Archivo subido", url: publicUrl });
    });

    stream.end(file.buffer);
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});


module.exports = router;
