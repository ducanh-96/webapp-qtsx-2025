import { GoogleAuth } from 'google-auth-library';
import { drive_v3, sheets_v4, google } from 'googleapis';

// Google API Configuration
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
];

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 100,
  timeWindow: 60 * 1000, // 1 minute
  requests: new Map<string, number[]>(),
};

class GoogleAPIService {
  private auth: GoogleAuth | null = null;
  private drive: drive_v3.Drive | null = null;
  private sheets: sheets_v4.Sheets | null = null;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Initialize Google Auth
      this.auth = new GoogleAuth({
        scopes: SCOPES,
        credentials: process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? 
          JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY) : undefined,
      });

      // Initialize Drive API
      this.drive = google.drive({ 
        version: 'v3', 
        auth: this.auth 
      });

      // Initialize Sheets API
      this.sheets = google.sheets({ 
        version: 'v4', 
        auth: this.auth 
      });

      console.log('Google APIs initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google APIs:', error);
    }
  }

  // Rate limiting helper
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userRequests = RATE_LIMIT.requests.get(userId) || [];
    
    // Remove requests older than time window
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < RATE_LIMIT.timeWindow
    );
    
    if (recentRequests.length >= RATE_LIMIT.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    RATE_LIMIT.requests.set(userId, recentRequests);
    return true;
  }

  // Error handling wrapper
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff for rate limiting errors
        if (error.code === 429) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        } else if (error.code >= 500) {
          // Server errors - retry with delay
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Client errors - don't retry
          throw error;
        }
      }
    }
    throw new Error('Max retries exceeded');
  }

  // Google Drive Methods
  async listFiles(
    userId: string,
    pageSize: number = 20,
    pageToken?: string,
    query?: string
  ): Promise<{
    files: drive_v3.Schema$File[];
    nextPageToken?: string;
  }> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded');
    }

    if (!this.drive) {
      throw new Error('Google Drive API not initialized');
    }

    return this.executeWithRetry(async () => {
      const response = await this.drive!.files.list({
        pageSize,
        pageToken,
        q: query || "trashed=false",
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, owners, parents, webViewLink, webContentLink, thumbnailLink)',
        orderBy: 'modifiedTime desc',
      });

      return {
        files: response.data.files || [],
        nextPageToken: response.data.nextPageToken || undefined,
      };
    });
  }

  async getFile(userId: string, fileId: string): Promise<drive_v3.Schema$File> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded');
    }

    if (!this.drive) {
      throw new Error('Google Drive API not initialized');
    }

    return this.executeWithRetry(async () => {
      const response = await this.drive!.files.get({
        fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, owners, parents, webViewLink, webContentLink, thumbnailLink, description',
      });

      return response.data;
    });
  }

  async createFile(
    userId: string,
    name: string,
    content: string,
    mimeType: string = 'text/plain',
    parentId?: string
  ): Promise<drive_v3.Schema$File> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded');
    }

    if (!this.drive) {
      throw new Error('Google Drive API not initialized');
    }

    return this.executeWithRetry(async () => {
      const fileMetadata: drive_v3.Schema$File = {
        name,
        parents: parentId ? [parentId] : undefined,
      };

      const media = {
        mimeType,
        body: content,
      };

      const response = await this.drive!.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, name, webViewLink',
      });

      return response.data;
    });
  }

  async updateFile(
    userId: string,
    fileId: string,
    content?: string,
    metadata?: Partial<drive_v3.Schema$File>
  ): Promise<drive_v3.Schema$File> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded');
    }

    if (!this.drive) {
      throw new Error('Google Drive API not initialized');
    }

    return this.executeWithRetry(async () => {
      const updateParams: any = {
        fileId,
        fields: 'id, name, modifiedTime',
      };

      if (metadata) {
        updateParams.requestBody = metadata;
      }

      if (content) {
        updateParams.media = {
          body: content,
        };
      }

      const response = await this.drive!.files.update(updateParams);
      return response.data;
    });
  }

  async deleteFile(userId: string, fileId: string): Promise<void> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded');
    }

    if (!this.drive) {
      throw new Error('Google Drive API not initialized');
    }

    return this.executeWithRetry(async () => {
      await this.drive!.files.delete({ fileId });
    });
  }

  async createFolder(
    userId: string,
    name: string,
    parentId?: string
  ): Promise<drive_v3.Schema$File> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded');
    }

    if (!this.drive) {
      throw new Error('Google Drive API not initialized');
    }

    return this.executeWithRetry(async () => {
      const fileMetadata: drive_v3.Schema$File = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined,
      };

      const response = await this.drive!.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, webViewLink',
      });

      return response.data;
    });
  }

  async shareFile(
    userId: string,
    fileId: string,
    email: string,
    role: 'reader' | 'writer' | 'commenter' = 'reader'
  ): Promise<void> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded');
    }

    if (!this.drive) {
      throw new Error('Google Drive API not initialized');
    }

    return this.executeWithRetry(async () => {
      await this.drive!.permissions.create({
        fileId,
        requestBody: {
          role,
          type: 'user',
          emailAddress: email,
        },
        sendNotificationEmail: true,
      });
    });
  }

  // Google Sheets Methods
  async createSpreadsheet(
    userId: string,
    title: string,
    headers?: string[]
  ): Promise<sheets_v4.Schema$Spreadsheet> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded');
    }

    if (!this.sheets) {
      throw new Error('Google Sheets API not initialized');
    }

    return this.executeWithRetry(async () => {
      const spreadsheet: sheets_v4.Schema$Spreadsheet = {
        properties: { title },
        sheets: [{
          properties: {
            title: 'Sheet1',
            gridProperties: {
              rowCount: 1000,
              columnCount: 26,
            },
          },
        }],
      };

      const response = await this.sheets!.spreadsheets.create({
        requestBody: spreadsheet,
      });

      // Add headers if provided
      if (headers && headers.length > 0) {
        await this.updateSheetData(
          userId,
          response.data.spreadsheetId!,
          'Sheet1!A1',
          [headers]
        );
      }

      return response.data;
    });
  }

  async getSheetData(
    userId: string,
    spreadsheetId: string,
    range: string
  ): Promise<string[][]> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded');
    }

    if (!this.sheets) {
      throw new Error('Google Sheets API not initialized');
    }

    return this.executeWithRetry(async () => {
      const response = await this.sheets!.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return response.data.values || [];
    });
  }

  async updateSheetData(
    userId: string,
    spreadsheetId: string,
    range: string,
    values: string[][]
  ): Promise<void> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded');
    }

    if (!this.sheets) {
      throw new Error('Google Sheets API not initialized');
    }

    return this.executeWithRetry(async () => {
      await this.sheets!.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });
    });
  }

  async appendSheetData(
    userId: string,
    spreadsheetId: string,
    range: string,
    values: string[][]
  ): Promise<void> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded');
    }

    if (!this.sheets) {
      throw new Error('Google Sheets API not initialized');
    }

    return this.executeWithRetry(async () => {
      await this.sheets!.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values,
        },
      });
    });
  }

  async batchUpdateSheet(
    userId: string,
    spreadsheetId: string,
    requests: sheets_v4.Schema$Request[]
  ): Promise<void> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded');
    }

    if (!this.sheets) {
      throw new Error('Google Sheets API not initialized');
    }

    return this.executeWithRetry(async () => {
      await this.sheets!.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests,
        },
      });
    });
  }

  // Utility Methods
  async searchFiles(
    userId: string,
    searchQuery: string,
    mimeType?: string
  ): Promise<drive_v3.Schema$File[]> {
    let query = `name contains '${searchQuery}' and trashed=false`;
    
    if (mimeType) {
      query += ` and mimeType='${mimeType}'`;
    }

    const result = await this.listFiles(userId, 50, undefined, query);
    return result.files;
  }

  async getFilesByFolder(
    userId: string,
    folderId: string
  ): Promise<drive_v3.Schema$File[]> {
    const query = `'${folderId}' in parents and trashed=false`;
    const result = await this.listFiles(userId, 100, undefined, query);
    return result.files;
  }

  // Check API health
  async healthCheck(): Promise<{ drive: boolean; sheets: boolean }> {
    const health = { drive: false, sheets: false };

    try {
      if (this.drive) {
        await this.drive.files.list({ pageSize: 1 });
        health.drive = true;
      }
    } catch (error) {
      console.error('Drive API health check failed:', error);
    }

    try {
      if (this.sheets) {
        // Test with a known public spreadsheet or create a temporary one
        health.sheets = true;
      }
    } catch (error) {
      console.error('Sheets API health check failed:', error);
    }

    return health;
  }
}

// Export singleton instance
export const googleApiService = new GoogleAPIService();
export default googleApiService;