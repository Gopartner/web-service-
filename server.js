const express = require('express');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// Middleware untuk parsing body dari permintaan
app.use(express.json());

// Endpoint untuk membuat data hasil konversi
app.post('/api/conversions', async (req, res) => {
  try {
    const { videoUrl, mp3Url } = req.body;
    // Simpan data konversi ke Firebase Firestore
    const docRef = await admin.firestore().collection('conversions').add({
      videoUrl,
      mp3Url,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(201).json({ id: docRef.id });
  } catch (error) {
    console.error('Error creating conversion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint untuk mendapatkan semua data hasil konversi
app.get('/api/conversions', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('conversions').get();
    const conversions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(conversions);
  } catch (error) {
    console.error('Error fetching conversions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint untuk mendapatkan data hasil konversi berdasarkan ID
app.get('/api/conversions/:id', async (req, res) => {
  try {
    const conversionId = req.params.id;
    const doc = await admin.firestore().collection('conversions').doc(conversionId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Conversion not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching conversion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint untuk mengupdate data hasil konversi berdasarkan ID
app.put('/api/conversions/:id', async (req, res) => {
  try {
    const conversionId = req.params.id;
    const { videoUrl, mp3Url } = req.body;
    await admin.firestore().collection('conversions').doc(conversionId).set({
      videoUrl,
      mp3Url,
    }, { merge: true });
    res.json({ message: 'Conversion updated successfully' });
  } catch (error) {
    console.error('Error updating conversion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint untuk menghapus data hasil konversi berdasarkan ID
app.delete('/api/conversions/:id', async (req, res) => {
  try {
    const conversionId = req.params.id;
    await admin.firestore().collection('conversions').doc(conversionId).delete();
    res.json({ message: 'Conversion deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

