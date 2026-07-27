/**
 * Service de Gestion du Stockage d'Objets Cloudflare R2
 * Gère le verset, la lecture, la suppression et la génération d'URLs sécurisées
 * pour les fichiers de mémoires PDF et les certificats numériques.
 */

export interface CloudflareR2Env {
  MEMOIRES_R2?: {
    put(key: string, value: ReadableStream | ArrayBuffer | string, options?: any): Promise<any>;
    get(key: string): Promise<any>;
    delete(key: string): Promise<void>;
  };
}

export class CloudflareR2StorageService {
  private bucket?: CloudflareR2Env['MEMOIRES_R2'];

  constructor(env?: CloudflareR2Env) {
    if (env && env.MEMOIRES_R2) {
      this.bucket = env.MEMOIRES_R2;
    }
  }

  /**
   * Sauvegarde un fichier mémoire ou un certificat dans le Bucket Cloudflare R2
   */
  async uploadFile(
    key: string,
    fileBuffer: ArrayBuffer | Uint8Array,
    contentType: string = 'application/pdf',
    metadata: Record<string, string> = {}
  ): Promise<{ key: string; publicUrl: string }> {
    if (this.bucket) {
      await this.bucket.put(key, fileBuffer, {
        httpMetadata: { contentType },
        customMetadata: metadata,
      });

      return {
        key,
        publicUrl: `/api/files/r2/${encodeURIComponent(key)}`,
      };
    }

    // Fallback pour environnement local/dev
    return {
      key,
      publicUrl: `/uploads/${key}`,
    };
  }

  /**
   * Récupère un fichier depuis Cloudflare R2
   */
  async getFile(key: string) {
    if (this.bucket) {
      const object = await this.bucket.get(key);
      if (!object) {
        return null;
      }
      return object;
    }
    return null;
  }

  /**
   * Supprime un objet de Cloudflare R2
   */
  async deleteFile(key: string): Promise<boolean> {
    if (this.bucket) {
      await this.bucket.delete(key);
      return true;
    }
    return false;
  }
}
