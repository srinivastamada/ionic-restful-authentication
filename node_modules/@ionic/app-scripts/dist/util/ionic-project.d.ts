export interface IonicProject {
    name: string;
    email: string;
    app_id: string;
    proxies: {
        path: string;
        proxyUrl: string;
        proxyNoAgent: boolean;
        rejectUnauthorized: boolean;
    }[];
}
export declare function getProjectJson(): Promise<IonicProject>;
