import mongoose from 'mongoose';

// Fetch images from a single document per plant (images array). Falls back to legacy per-image docs.
export const getImagesByPlantName = async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Plant name is required' });
    }

    const normalized = name.replace(/\s+/g, '').toLowerCase();
    const db = mongoose.connection;
    const collection = db.collection('images');

    // Prefer the consolidated doc format: { plantName, normalizedPlantName, images: [{ url, title, caption, ... }] }
    const doc = await collection.findOne({
      $or: [
        { normalizedPlantName: normalized },
        { plantName: { $regex: new RegExp(`^${name}$`, 'i') } },
      ],
      images: { $exists: true },
    });

    if (doc && Array.isArray(doc.images)) {
      const origin = `${req.protocol}://${req.get('host')}`;
      const mapped = (doc.images || [])
        .map((img) => {
          let src = img.url || null;
          if (src) {
            // Normalize to absolute URL if needed
            if (/^\//.test(src)) {
              src = `${origin}${src}`;
            } else if (!/^https?:\/\//i.test(src)) {
              // treat as relative path
              src = `${origin}/${src.replace(/^\//, '')}`;
            }
          }
          return ({
            _id: img._id || undefined,
            plantName: doc.plantName,
            title: img.title || null,
            caption: img.caption || null,
            src,
          });
        })
        .filter((i) => !!i.src);
      if (mapped.length) {
        return res.json({ success: true, data: mapped });
      }
      // fallthrough to legacy if consolidated URLs unusable
    }

    // Legacy fallback: multiple docs per image
    const legacy = await collection
      .find({
        $or: [
          { normalizedPlantName: normalized },
          { plantName: { $regex: new RegExp(`^${name}$`, 'i') } },
          { plantName: { $regex: new RegExp(name, 'i') } },
        ],
      })
      .project({ plantName: 1, url: 1, title: 1, caption: 1, contentType: 1, data: 1 })
      .toArray();

    const mappedLegacy = legacy.map((img) => {
      let src = img.url;
      if (!src && img.data && img.contentType) {
        const base64 = Buffer.from(img.data.buffer || img.data).toString('base64');
        src = `data:${img.contentType};base64,${base64}`;
      }
      return {
        _id: img._id,
        plantName: img.plantName,
        title: img.title || null,
        caption: img.caption || null,
        src: src || null,
      };
    }).filter((i) => !!i.src);

    return res.json({ success: true, data: mappedLegacy });
  } catch (err) {
    console.error('Error fetching images:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
