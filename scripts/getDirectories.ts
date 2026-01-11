import {readdir}  from 'node:fs/promises';
import { join } from 'node:path';

export async function getDirectories(dirPath: string) {
  const directories: string[] = [];
  try {
    // Read the directory and get dirent objects (which include file type information)
    const entries = await readdir(dirPath, { withFileTypes: true });

    console.log(`Directories in: ${dirPath}`);

    // Loop through each entry
    for (const entry of entries) {
      // Check if the entry is a directory
      if (entry.isDirectory()) {
        directories.push(entry.name);
      }
    }
  } catch (err) {
    console.error('Error reading directory:', err);
  }
  return directories;
}
