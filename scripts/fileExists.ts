import * as fs from 'fs/promises';
import { constants } from 'fs';

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}
