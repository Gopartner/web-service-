const express = require('express');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Endpoint untuk mengunduh video dari URL YouTube
app.post('/download', async (req, res) => {
    const { url } = req.body;
    try {
        const info = await ytdl.getInfo(url);
        const videoUrl = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' }).url;
        res.json({ success: true, message: 'Video berhasil diunduh.', videoUrl });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengunduh video.', error: error.message });
    }
});

// Endpoint untuk mengkonversi video menjadi file MP3
app.post('/convert', async (req, res) => {
    const { videoUrl } = req.body;
    try {
        const fileName = `${Date.now()}.mp3`;
        ffmpeg(videoUrl)
            .toFormat('mp3')
            .saveToFile(fileName)
            .on('end', () => {
                res.json({ success: true, message: 'Konversi berhasil.', fileName });
            });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal melakukan konversi.', error: error.message });
    }
});

// Endpoint untuk mengunduh file MP3
app.get('/download/:fileName', (req, res) => {
    const { fileName } = req.params;
    const filePath = `${__dirname}/${fileName}`;
    res.download(filePath, (err) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Gagal mengunduh file.', error: err.message });
        } else {
            fs.unlinkSync(filePath);
        }
    });
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

