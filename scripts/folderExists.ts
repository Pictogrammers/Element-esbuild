import { access } from 'node:fs/promises';
import { constants } from 'node:fs';

export async function folderExists(folderPath: string): Promise<boolean> {
  try {
    // Check if the path exists (F_OK) and Node.js can access it
    await access(folderPath, constants.F_OK);
    // If no error is thrown, the folder exists
    return true; 
  } catch (error) {
    // If an error occurs, it generally means the folder does not exist or permissions are insufficient
    return false;
  }
}
