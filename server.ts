import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Supabase admin client (optional, depending on RLS)
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // OnlyOffice Callback Handler
  app.post('/api/onlyoffice/callback', async (req, res) => {
    try {
      // Verify JWT if enabled
      if (process.env.ONLYOFFICE_JWT_SECRET) {
        const header = process.env.ONLYOFFICE_JWT_HEADER || 'Authorization';
        const token = req.headers[header.toLowerCase()] as string;
        
        if (!token) {
          console.error('Missing ONLYOFFICE JWT token in header');
          return res.status(401).json({ error: 1, message: 'Authorization required' });
        }

        try {
          const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;
          const decoded = jwt.verify(actualToken, process.env.ONLYOFFICE_JWT_SECRET);
          // OnlyOffice might wrap the body in the token
          if (typeof decoded === 'object' && (decoded as any).payload) {
             req.body = (decoded as any).payload;
          }
        } catch (err) {
          console.error('ONLYOFFICE JWT verification failed:', err);
          return res.status(401).json({ error: 1, message: 'Invalid token' });
        }
      }

      const { status, url, userdata } = req.body;
      const { userId, fileId, fileName } = JSON.parse(userdata || '{}');

      // Status 2 or 6 means file is ready for saving
      if (status === 2 || status === 6) {
        console.log(`Saving file ${fileId} from OnlyOffice...`);
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch file from OnlyOffice');
        
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        // 1. Fetch current file version to increment
        const { data: fileData, error: fetchError } = await supabase
          .from('files')
          .select('version, file_url')
          .eq('id', fileId)
          .single();

        if (fetchError) throw fetchError;

        const nextVersion = (fileData.version || 0) + 1;
        const storagePath = `${userId}/${fileId}_v${nextVersion}_${fileName}`;

        // 2. Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('user-files')
          .upload(storagePath, arrayBuffer, { 
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            upsert: true 
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('user-files')
          .getPublicUrl(storagePath);

        // 3. Update database record
        const { error: updateError } = await supabase
          .from('files')
          .update({
            file_url: publicUrl,
            version: nextVersion,
            file_size: arrayBuffer.byteLength,
            updated_at: new Date().toISOString()
          })
          .eq('id', fileId);

        if (updateError) throw updateError;
        
        // 4. Create version record
        await supabase.from('file_versions').insert({
          file_id: fileId,
          file_url: publicUrl,
          version_number: nextVersion,
          created_by: userId
        });

        console.log(`File ${fileId} saved successfully.`);
      }

      res.json({ error: 0 });
    } catch (error: any) {
      console.error('OnlyOffice callback error:', error);
      res.status(500).json({ error: 1, message: error.message });
    }
  });

  // OnlyOffice Config Endpoint
  app.get('/api/onlyoffice/config', async (req, res) => {
    try {
      const { fileId, userId, mode = 'edit' } = req.query;
      
      const { data: file, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (error || !file) return res.status(404).json({ error: 'File not found' });

      // Generate signed URL for OnlyOffice to fetch
      const { data: signedData, error: signedError } = await supabase.storage
        .from('user-files')
        .createSignedUrl(`${file.user_id}/${file.id}_v${file.version}_${file.file_name}`, 3600);

      if (signedError) throw signedError;

      const isSpreadsheet = file.file_name.endsWith('.xlsx') || file.file_name.endsWith('.xls') || file.file_name.endsWith('.csv');
      const isPresentation = file.file_name.endsWith('.pptx') || file.file_name.endsWith('.ppt');

      const config = {
        document: {
          fileType: file.file_name.split('.').pop(),
          key: `${file.id}_v${file.version}`,
          title: file.file_name,
          url: signedData.signedUrl,
        },
        documentType: isSpreadsheet ? 'spreadsheet' : isPresentation ? 'presentation' : 'word',
        editorConfig: {
          callbackUrl: `${process.env.APP_URL}/api/onlyoffice/callback`,
          user: {
            id: userId,
            name: 'User ' + userId?.toString().slice(0, 4),
          },
          mode: mode,
          customization: {
            autosave: true,
            chat: true,
            comments: true,
          },
          userdata: JSON.stringify({ userId: file.user_id, fileId: file.id, fileName: file.file_name })
        }
      };

      // Sign with JWT if secret provided
      if (process.env.ONLYOFFICE_JWT_SECRET) {
        const token = jwt.sign(config, process.env.ONLYOFFICE_JWT_SECRET, { expiresIn: '1h' });
        (config as any).token = token;
      }

      res.json(config);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
