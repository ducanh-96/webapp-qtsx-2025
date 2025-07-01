// Power BI Configuration
interface PowerBIConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  workspaceId: string;
  reportId: string;
}

interface EmbedToken {
  token: string;
  tokenId: string;
  expiration: string;
}

interface PowerBIReport {
  id: string;
  name: string;
  embedUrl: string;
  datasetId: string;
  isReadOnly: boolean;
}

interface BasicFilter {
  $schema: string;
  target: {
    table: string;
    column: string;
  };
  operator: string;
  values: string[];
  filterType: number;
}

interface EmbedConfiguration {
  type: string;
  id: string;
  embedUrl: string;
  accessToken: string;
  tokenType: number;
  settings: {
    panes: {
      filters: {
        expanded: boolean;
        visible: boolean;
      };
      pageNavigation: {
        visible: boolean;
      };
    };
    background: number;
    layoutType: number;
    displayOption: number;
  };
  permissions: number;
  filters?: BasicFilter[];
}

class PowerBIService {
  private config: PowerBIConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.config = {
      clientId: process.env.NEXT_PUBLIC_POWER_BI_CLIENT_ID || '',
      clientSecret: process.env.POWER_BI_CLIENT_SECRET || '',
      tenantId: process.env.POWER_BI_TENANT_ID || '',
      workspaceId: process.env.POWER_BI_WORKSPACE_ID || '',
      reportId: process.env.POWER_BI_REPORT_ID || '',
    };
  }

  // Get Azure AD access token for Power BI
  private async getAccessToken(): Promise<string> {
    // Check if current token is still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
      
      const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        scope: 'https://analysis.windows.net/powerbi/api/.default',
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      
      // Set token expiry (subtract 5 minutes for safety)
      this.tokenExpiry = new Date(Date.now() + (data.expires_in - 300) * 1000);
      
      return this.accessToken!;
    } catch (error) {
      console.error('Error getting Power BI access token:', error);
      throw error;
    }
  }

  // Get embed token for specific report
  async getEmbedToken(reportId: string, userId?: string): Promise<EmbedToken> {
    try {
      const accessToken = await this.getAccessToken();
      
      const url = `https://api.powerbi.com/v1.0/myorg/groups/${this.config.workspaceId}/reports/${reportId}/GenerateToken`;
      
      const requestBody: any = {
        accessLevel: 'View',
        allowSaveAs: false,
      };

      // Add row-level security if user is specified
      if (userId) {
        requestBody.identities = [
          {
            username: userId,
            roles: ['User'], // This should match your RLS role in Power BI
            datasets: [reportId],
          },
        ];
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Failed to get embed token: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        token: data.token,
        tokenId: data.tokenId,
        expiration: data.expiration,
      };
    } catch (error) {
      console.error('Error getting Power BI embed token:', error);
      throw error;
    }
  }

  // Get report details
  async getReport(reportId: string): Promise<PowerBIReport> {
    try {
      const accessToken = await this.getAccessToken();
      
      const url = `https://api.powerbi.com/v1.0/myorg/groups/${this.config.workspaceId}/reports/${reportId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get report: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        name: data.name,
        embedUrl: data.embedUrl,
        datasetId: data.datasetId,
        isReadOnly: data.isReadOnly,
      };
    } catch (error) {
      console.error('Error getting Power BI report:', error);
      throw error;
    }
  }

  // Get all reports in workspace
  async getReports(): Promise<PowerBIReport[]> {
    try {
      const accessToken = await this.getAccessToken();
      
      const url = `https://api.powerbi.com/v1.0/myorg/groups/${this.config.workspaceId}/reports`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get reports: ${response.statusText}`);
      }

      const data = await response.json();
      return data.value.map((report: any) => ({
        id: report.id,
        name: report.name,
        embedUrl: report.embedUrl,
        datasetId: report.datasetId,
        isReadOnly: report.isReadOnly,
      }));
    } catch (error) {
      console.error('Error getting Power BI reports:', error);
      throw error;
    }
  }

  // Create embed configuration for React component
  async createEmbedConfig(
    reportId: string,
    userId?: string,
    filters?: BasicFilter[]
  ): Promise<EmbedConfiguration> {
    try {
      const [report, embedToken] = await Promise.all([
        this.getReport(reportId),
        this.getEmbedToken(reportId, userId),
      ]);

      const embedConfig: EmbedConfiguration = {
        type: 'report',
        id: report.id,
        embedUrl: report.embedUrl,
        accessToken: embedToken.token,
        tokenType: 1, // Embed token
        settings: {
          panes: {
            filters: {
              expanded: false,
              visible: true,
            },
            pageNavigation: {
              visible: true,
            },
          },
          background: 2, // Transparent
          layoutType: 0, // FitToWidth
          displayOption: 0, // FitToPage
        },
        permissions: 1, // Read
      };

      // Add filters if provided
      if (filters && filters.length > 0) {
        embedConfig.filters = filters;
      }

      return embedConfig;
    } catch (error) {
      console.error('Error creating embed config:', error);
      throw error;
    }
  }

  // Refresh dataset
  async refreshDataset(datasetId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      
      const url = `https://api.powerbi.com/v1.0/myorg/groups/${this.config.workspaceId}/datasets/${datasetId}/refreshes`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notifyOption: 'NoNotification',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh dataset: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error refreshing Power BI dataset:', error);
      throw error;
    }
  }

  // Create user-specific filters for row-level security
  createUserFilters(userId: string, userRole: string, department?: string): BasicFilter[] {
    const filters: BasicFilter[] = [];

    // Filter by user ID
    filters.push({
      $schema: 'http://powerbi.com/product/schema#basic',
      target: {
        table: 'Users',
        column: 'UserId',
      },
      operator: 'In',
      values: [userId],
      filterType: 1, // BasicFilter
    });

    // Filter by role if not admin
    if (userRole !== 'admin') {
      filters.push({
        $schema: 'http://powerbi.com/product/schema#basic',
        target: {
          table: 'Documents',
          column: 'Department',
        },
        operator: 'In',
        values: department ? [department] : [],
        filterType: 1, // BasicFilter
      });
    }

    return filters;
  }

  // Health check for Power BI service
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      await this.getAccessToken();
      const reports = await this.getReports();
      
      return {
        status: 'healthy',
        message: `Connected successfully. Found ${reports.length} reports.`,
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        message: error.message || 'Power BI service unavailable',
      };
    }
  }

  // Check if Power BI is configured
  isConfigured(): boolean {
    return !!(
      this.config.clientId &&
      this.config.clientSecret &&
      this.config.tenantId &&
      this.config.workspaceId
    );
  }
}

// Export singleton instance
export const powerBiService = new PowerBIService();
export default powerBiService;

// Export types for use in components
export type { PowerBIReport, EmbedToken, PowerBIConfig, EmbedConfiguration, BasicFilter };