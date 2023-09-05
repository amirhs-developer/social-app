import cloudinary, { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// upload file to cloudinary cloud
/**
 *
 * @param file file to upload
 * @param public_id public_id for file is optional
 * @param overwrite overwrite for file is optional
 * @param invalidate invalidate for file is optional
 * @returns
 */

export function uploadToCloudinry(
  file: string,
  public_id?: string,
  overwrite?: boolean,
  invalidate?: boolean
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
  return new Promise((resolve) => {
    cloudinary.v2.uploader.upload(
      file,
      {
        public_id,
        overwrite,
        invalidate
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {

        if (error) resolve(error);

        resolve(result);
      }
    );
  });
}
