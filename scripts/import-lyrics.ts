import fs from 'fs';
import path from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { albums, tracks } from '../shared/schema';
import { CloudflareAutoRAG } from '../server/cloudflare-rag';
import { db } from '../server/db';

// Initialize CloudflareAutoRAG
const autoRAG = new CloudflareAutoRAG({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  apiToken: process.env.CLOUDFLARE_API_TOKEN!,
  indexName: 'hawk-eye-lyrics',
  projectName: 'lyrical-miracles'
});

interface AlbumMetadata {
  title: string;
  tracks: {
    title: string;
    trackNumber: number;
    duration?: string;
    audioUrl?: string;
    videoUrl?: string;
    imageUrl?: string;
    lyrics: string;
  }[];
  dedicatedTo?: string;
  description?: string;
  coverImage?: string;
  backImage?: string;
  sideImage?: string;
  discImage?: string;
  releaseYear?: number;
}

async function importLyrics() {
  try {
    // First, clear existing data
    await db.delete(tracks);
    await db.delete(albums);

    // Get the list of album directories
    const albumDirs = [
      'Full_Disclosure',
      'Behold_A_Pale_Horse',
      'MILABS',
      'Shadow_Banned',
      'Malicious_EP'
    ];

    for (const albumDir of albumDirs) {
      // Read album metadata from README or album info file
      const albumData = getAlbumMetadata(albumDir);

      // Insert album into database
      const [album] = await db.insert(albums).values({
        title: albumData.title,
        dedicatedTo: albumData.dedicatedTo,
        description: albumData.description,
        coverImage: albumData.coverImage,
        backImage: albumData.backImage,
        sideImage: albumData.sideImage,
        discImage: albumData.discImage,
        releaseYear: albumData.releaseYear,
        trackCount: albumData.tracks.length,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Process each track
      for (const track of albumData.tracks) {
        // Insert track into database
        await db.insert(tracks).values({
          albumId: album.id,
          title: track.title,
          trackNumber: track.trackNumber,
          duration: track.duration || '0:00',
          durationSeconds: parseDuration(track.duration || '0:00'),
          lyrics: track.lyrics,
          audioUrl: track.audioUrl,
          videoUrl: track.videoUrl,
          imageUrl: track.imageUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Index lyrics in Cloudflare AutoRAG
        await autoRAG.indexLyrics([{
          title: track.title,
          content: track.lyrics,
          album: albumData.title
        }]);

        console.log(`Indexed track: ${track.title}`);
      }

      console.log(`Imported album: ${albumData.title}`);
    }

    console.log('Import completed successfully!');

  } catch (error) {
    console.error('Import failed:', error);
  }
}

function getAlbumMetadata(albumDir: string): AlbumMetadata {
  // Read album metadata from README.md or album info file
  // TODO: Implement full metadata extraction
  return {
    title: albumDir.replace(/_/g, ' '),
    tracks: [], // TODO: Scan directory for track files
    releaseYear: new Date().getFullYear()
  };
}

function parseDuration(duration: string): number {
  const [minutes, seconds] = duration.split(':').map(Number);
  return minutes * 60 + seconds;
}

// Run the import
importLyrics().catch(console.error);