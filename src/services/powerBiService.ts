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
  private config: PowerBIConfig = {
    clientId: process.env.NEXT_PUBLIC_POWER_BI_CLIENT_ID || '',
    clientSecret: process.env.POWER_BI_CLIENT_SECRET || '',
    tenantId: process.env.POWER_BI_TENANT_ID || '',
    workspaceId: process.env.POWER_BI_WORKSPACE_ID || '',
    reportId: process.env.POWER_BI_REPORT_ID || '',
  };
  // Power BI API integration and access token logic removed.

  // Create user-specific filters for row-level security
  createUserFilters(
    userId: string,
    userRole: string,
    department?: string
  ): BasicFilter[] {
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

  // Power BI API health check removed.

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
export type {
  PowerBIReport,
  EmbedToken,
  PowerBIConfig,
  EmbedConfiguration,
  BasicFilter,
};
