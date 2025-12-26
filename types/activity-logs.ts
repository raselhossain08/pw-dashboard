export enum LogLevel {
    INFO = 'INFO',
    SUCCESS = 'SUCCESS',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
}

export enum LogCategory {
    USER = 'user',
    SYSTEM = 'system',
    ADMIN = 'admin',
    AI = 'ai',
    CHAT = 'chat',
    PAYMENT = 'payment',
    COURSE = 'course',
    SECURITY = 'security',
}

export enum ErrorSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export enum AiModel {
    GPT4 = 'gpt-4',
    GPT35 = 'gpt-3.5-turbo',
    CLAUDE = 'claude-3',
    GEMINI = 'gemini-pro',
    CUSTOM = 'custom',
}

export enum ChatType {
    USER_TO_USER = 'user_to_user',
    USER_TO_SUPPORT = 'user_to_support',
    USER_TO_INSTRUCTOR = 'user_to_instructor',
    GROUP_CHAT = 'group_chat',
    AI_CHAT = 'ai_chat',
}

export enum SystemEventType {
    SERVER_START = 'server_start',
    SERVER_STOP = 'server_stop',
    DATABASE_CONNECTION = 'database_connection',
    DATABASE_DISCONNECTION = 'database_disconnection',
    BACKUP_CREATED = 'backup_created',
    BACKUP_RESTORED = 'backup_restored',
    CACHE_CLEARED = 'cache_cleared',
    MIGRATION_RUN = 'migration_run',
    SCHEDULED_TASK = 'scheduled_task',
    API_HEALTH_CHECK = 'api_health_check',
    MEMORY_WARNING = 'memory_warning',
    CPU_WARNING = 'cpu_warning',
    DISK_WARNING = 'disk_warning',
}

export enum SystemStatus {
    HEALTHY = 'healthy',
    WARNING = 'warning',
    ERROR = 'error',
    CRITICAL = 'critical',
}

export interface ActivityLog {
    _id: string;
    level: LogLevel;
    category: LogCategory;
    title: string;
    message: string;
    metadata: string[];
    userId?: string;
    userName?: string;
    userEmail?: string;
    ipAddress?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
    duration?: number;
    statusCode?: number;
    isResolved: boolean;
    resolvedBy?: string;
    resolvedAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ErrorLog {
    _id: string;
    severity: ErrorSeverity;
    errorType: string;
    message: string;
    stack?: any;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    errorCode?: string;
    isResolved: boolean;
    resolvedBy?: string;
    resolvedAt?: string;
    solution?: string;
    occurrences: number;
    lastOccurrence?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AiLog {
    _id: string;
    aiModel: AiModel;
    prompt: string;
    response: string;
    tokensUsed: number;
    responseTime: number;
    userId?: string;
    userName?: string;
    conversationId?: string;
    intentType?: string;
    wasHelpful?: boolean;
    userFeedback?: string;
    cost?: number;
    status: string;
    errorMessage?: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface ChatLog {
    _id: string;
    chatType: ChatType;
    senderId: string;
    senderName: string;
    receiverId?: string;
    receiverName?: string;
    conversationId: string;
    message: string;
    attachments: string[];
    isRead: boolean;
    readAt?: string;
    isDeleted: boolean;
    deletedAt?: string;
    isFlagged: boolean;
    flagReason?: string;
    ipAddress?: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface SystemLog {
    _id: string;
    eventType: SystemEventType;
    status: SystemStatus;
    message: string;
    systemMetrics?: {
        cpuUsage?: number;
        memoryUsage?: number;
        diskUsage?: number;
        activeConnections?: number;
        requestsPerMinute?: number;
    };
    serviceName?: string;
    serviceVersion?: string;
    duration?: number;
    errorDetails?: any;
    stackTrace?: string;
    requiresAction: boolean;
    actionTaken?: string;
    resolvedBy?: string;
    resolvedAt?: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface LogsPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface LogsResponse<T> {
    success: boolean;
    data: T[];
    pagination: LogsPagination;
}

export interface ActivityStats {
    totalToday: number;
    totalYesterday: number;
    percentageChange: number;
    totalErrors: number;
    criticalErrors: number;
}

export interface ErrorStats {
    totalErrors: number;
    bySeverity: Array<{ _id: ErrorSeverity; count: number }>;
    recentErrors: Array<Partial<ErrorLog>>;
}

export interface AiStats {
    totalInteractions: number;
    avgResponseTime: number;
    byModel: Array<{ _id: AiModel; count: number }>;
    totalTokens: number;
}

export interface ChatStats {
    totalChats: number;
    activeConversations: number;
    unreadMessages: number;
}

export interface SystemStats {
    healthy: number;
    warning: number;
    error: number;
    critical: number;
}

export interface LogFilters {
    page?: number;
    limit?: number;
    level?: LogLevel;
    category?: LogCategory;
    severity?: ErrorSeverity;
    model?: AiModel;
    chatType?: ChatType;
    eventType?: SystemEventType;
    status?: SystemStatus | string;
    search?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    isResolved?: boolean;
    requiresAction?: boolean;
    minResponseTime?: number;
    maxResponseTime?: number;
    conversationId?: string;
    errorType?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}
