import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get user's custom designs
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('custom_designs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch designs' });
  }
});

// Upload custom design (or update existing)
router.post('/', authMiddleware, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {

    const userId = req.user?.id;
    const file = req.file;
    const { existing_image_url, designId } = req.body;

    // Multer only handles 'image' by default, so we need to handle additional files manually
    // Use req.files if using upload.fields
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;

    const {
      tshirt_type,
      tshirt_color,
      size,
      print_location,
      quantity,
      image_scale,
      image_rotation,
      price,
    } = req.body;

    // Prepare URLs for all images
    let imageUrl = existing_image_url;
    let originalFrontUrl = null;
    let originalBackUrl = null;
    let originalLeftUrl = null;
    let originalRightUrl = null;

    // Helper to upload a file buffer to Supabase and return the public URL
    async function uploadToSupabase(file: Express.Multer.File, side: string) {
      const fileName = `${userId}/${uuidv4()}-${side}-${file.originalname}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-designs')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });
      if (uploadError) {
        throw new Error(uploadError.message);
      }
      const { data: { publicUrl } } = supabase.storage
        .from('user-designs')
        .getPublicUrl(fileName);
      return publicUrl;
    }

    // If using upload.fields, handle all files
    if (req.files) {
      // Handle original images
      for (const side of ['front', 'back', 'left', 'right']) {
        const key = `original_${side}`;
        if (files && files[key] && files[key][0]) {
          const url = await uploadToSupabase(files[key][0], key);
          if (side === 'front') originalFrontUrl = url;
          if (side === 'back') originalBackUrl = url;
          if (side === 'left') originalLeftUrl = url;
          if (side === 'right') originalRightUrl = url;
        }
      }
      // Handle composed texture
      if (files['image'] && files['image'][0]) {
        imageUrl = await uploadToSupabase(files['image'][0], 'composed');
      }
    } else if (file) {
      // Fallback for single file (composed texture)
      imageUrl = await uploadToSupabase(file, 'composed');
    }

    // If editing, update existing design
    const updateOrInsert = async (isUpdate: boolean) => {
      const payload: any = {
        image_url: imageUrl,
        tshirt_type,
        tshirt_color,
        size,
        print_location,
        quantity,
        image_scale: parseFloat(image_scale),
        image_rotation: parseFloat(image_rotation),
        price: price !== undefined ? parseFloat(price) : null,
        // Store original image URLs
        original_front_url: originalFrontUrl,
        original_back_url: originalBackUrl,
        original_left_url: originalLeftUrl,
        original_right_url: originalRightUrl,
      };
      if (isUpdate) {
        const { data, error } = await supabase
          .from('custom_designs')
          .update(payload)
          .eq('id', designId)
          .eq('user_id', userId)
          .select()
          .single();
        if (error) {
          return res.status(400).json({ error: error.message });
        }
        return res.json(data);
      } else {
        const { data, error } = await supabase
          .from('custom_designs')
          .insert([{ user_id: userId, status: 'pending', ...payload }])
          .select()
          .single();
        if (error) {
          return res.status(400).json({ error: error.message });
        }
        return res.status(201).json(data);
      }
    };

    if (designId) {
      return await updateOrInsert(true);
    } else {
      return await updateOrInsert(false);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to save design' });
  }
});

// Get single design (public - for editing)
router.get('/design/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('custom_designs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Design not found' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch design' });
  }
});

// Get single design (authenticated)
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('custom_designs')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Design not found' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch design' });
  }
});

// Delete design
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get design to delete image from storage
    const { data: design } = await supabase
      .from('custom_designs')
      .select('image_url')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (design?.image_url) {
      // Extract file path from URL
      const urlParts = design.image_url.split('/');
      const filePath = urlParts.slice(-2).join('/');
      
      await supabase.storage
        .from('user-designs')
        .remove([filePath]);
    }

    const { error } = await supabase
      .from('custom_designs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Design deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete design' });
  }
});

export default router;
