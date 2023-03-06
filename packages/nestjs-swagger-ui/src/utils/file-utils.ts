import fs from 'fs';
import { Readable } from 'stream';

export const bufferToStream = (buffer: Buffer): Readable => {
  return new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
};

export const writeObjectInAFile = async (filePath: string, obj: unknown) => {
  await fs.promises.writeFile(filePath, JSON.stringify(obj, null, 2));
};
