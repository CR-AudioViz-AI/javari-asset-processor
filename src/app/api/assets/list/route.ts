import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

interface StorageItem {
  name: string;
  id: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
}

async function listFolder(prefix: string): Promise<StorageItem[]> {
  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/list/game-assets`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefix, limit: 1000 }),
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    // Get root folders
    const rootItems = await listFolder('');
    
    const folders: { name: string; count: number; items: StorageItem[] }[] = [];
    
    // For each folder, get contents
    for (const item of rootItems) {
      if (!item.name.includes('.')) {
        // It's a folder
        const folderName = item.name;
        const contents = await listFolder(folderName);
        
        // Get all files recursively
        const allFiles: StorageItem[] = [];
        
        for (const content of contents) {
          if (content.name.includes('.')) {
            // It's a file
            allFiles.push({
              ...content,
              name: content.name,
            });
          } else {
            // It's a subfolder, get its contents
            const subContents = await listFolder(`${folderName}/${content.name}`);
            for (const subItem of subContents) {
              if (subItem.name.includes('.')) {
                allFiles.push({
                  ...subItem,
                  name: `${content.name}/${subItem.name}`,
                });
              }
            }
          }
        }
        
        folders.push({
          name: folderName,
          count: allFiles.length,
          items: allFiles,
        });
      }
    }
    
    return NextResponse.json({ folders });
  } catch (error) {
    console.error('Error listing assets:', error);
    return NextResponse.json({ error: 'Failed to list assets', folders: [] }, { status: 500 });
  }
}
