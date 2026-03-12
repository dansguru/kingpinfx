import { LocalStorageConstants, LocalStorageUtils, URLUtils } from '@deriv-com/utils';
import { isStaging } from '../url/helpers';

export const APP_IDS = {
    LOCALHOST: 36300,
    TMP_STAGING: 64584,
    STAGING: 29934,
    STAGING_BE: 29934,
    STAGING_ME: 29934,
    PRODUCTION: 65555,
    PRODUCTION_BE: 65556,
    PRODUCTION_ME: 65557,
    // WebSocket API app_id (numeric). OAuth client ids are handled separately.
    KINGPINFX: 65555,
};

// OAuth client ids (used by Deriv OAuth/OIDC)
export const OAUTH_APP_IDS = {
    KINGPINFX: '32GDkuVxLy21Nq6g8RGWc',
};

export const livechat_license_id = 12049137;
export const livechat_client_id = '66aa088aad5a414484c1fd1fa8a5ace7';

export const domain_app_ids = {
    'kingpinfx.vercel.app': APP_IDS.KINGPINFX,
    'master.bot-standalone.pages.dev': APP_IDS.TMP_STAGING,
    'staging-dbot.deriv.com': APP_IDS.STAGING,
    'staging-dbot.deriv.be': APP_IDS.STAGING_BE,
    'staging-dbot.deriv.me': APP_IDS.STAGING_ME,
    'dbot.deriv.com': APP_IDS.PRODUCTION,
    'dbot.deriv.be': APP_IDS.PRODUCTION_BE,
    'dbot.deriv.me': APP_IDS.PRODUCTION_ME,
};

const domain_oauth_app_ids: Record<string, string> = {
    'kingpinfx.vercel.app': OAUTH_APP_IDS.KINGPINFX,
};

export const getCurrentProductionDomain = () =>
    !/^staging\./.test(window.location.hostname) &&
    Object.keys(domain_app_ids).find(domain => window.location.hostname === domain);

export const isProduction = () => {
    const all_domains = Object.keys(domain_app_ids).map(domain => `(www\\.)?${domain.replace('.', '\\.')}`);
    return new RegExp(`^(${all_domains.join('|')})$`, 'i').test(window.location.hostname);
};

export const isTestLink = () => {
    return (
        window.location.origin?.includes('.binary.sx') ||
        window.location.origin?.includes('bot-65f.pages.dev') ||
        isLocal()
    );
};

export const isLocal = () => /localhost(:\d+)?$/i.test(window.location.hostname);

const getDefaultServerURL = () => {
    if (isTestLink()) {
        return 'ws.derivws.com';
    }

    let active_loginid_from_url;
    const search = window.location.search;
    if (search) {
        const params = new URLSearchParams(document.location.search.substring(1));
        active_loginid_from_url = params.get('acct1');
    }

    const loginid = window.localStorage.getItem('active_loginid') ?? active_loginid_from_url;
    const is_real = loginid && !/^(VRT|VRW)/.test(loginid);

    const server = is_real ? 'green' : 'blue';
    const server_url = `${server}.derivws.com`;

    return server_url;
};

export const getDefaultAppIdAndUrl = () => {
    const server_url = getDefaultServerURL();

    if (isTestLink()) {
        return { app_id: APP_IDS.LOCALHOST, server_url };
    }

    const current_domain = getCurrentProductionDomain() ?? '';
    const app_id = domain_app_ids[current_domain as keyof typeof domain_app_ids] ?? APP_IDS.PRODUCTION;

    return { app_id, server_url };
};

export const getAppId = () => {
    let app_id = null;
    const config_app_id = window.localStorage.getItem('config.app_id');
    const current_domain = getCurrentProductionDomain() ?? '';

    // If we're on a known production domain, always prefer its configured app_id.
    // This prevents stale local overrides from breaking OAuth in production.
    if (current_domain && domain_app_ids[current_domain as keyof typeof domain_app_ids]) {
        return domain_app_ids[current_domain as keyof typeof domain_app_ids];
    }

    if (config_app_id && (isTestLink() || isStaging() || !current_domain)) {
        app_id = config_app_id;
    } else if (isStaging()) {
        app_id = APP_IDS.STAGING;
    } else if (isTestLink()) {
        app_id = APP_IDS.LOCALHOST;
    } else {
        app_id = domain_app_ids[current_domain as keyof typeof domain_app_ids] ?? APP_IDS.PRODUCTION;
    }

    return app_id;
};

export const getOAuthAppId = () => {
    const oauth_app_id = domain_oauth_app_ids[window.location.hostname];
    if (oauth_app_id) return oauth_app_id;

    // Fallback to the WS app_id if we don't have an OAuth client id configured.
    return String(getAppId());
};

export const ensureOidcClientId = () => {
    const oauth_app_id = domain_oauth_app_ids[window.location.hostname];
    if (!oauth_app_id) return;

    // @deriv-com/auth-client reads client_id from localStorage `config.app_id`.
    // Keep it set for custom domains while still allowing WS app_id to be numeric.
    if (localStorage.getItem('config.app_id') !== oauth_app_id) {
        localStorage.setItem('config.app_id', oauth_app_id);
    }
};

export const isDerivOidcCallbackUrl = () => {
    const { pathname, search, hash } = window.location;
    if (pathname === '/callback') return true;

    const params = new URLSearchParams(search);
    const hasOidcQueryParams =
        params.has('code') ||
        params.has('error') ||
        params.has('error_description') ||
        params.has('access_token') ||
        params.has('id_token') ||
        params.has('session_state');

    const hasOidcHashParams = /(^|[&#])(access_token|id_token|error)=/i.test(hash);

    return hasOidcQueryParams || hasOidcHashParams;
};

export const getOAuthCallbackUrl = () => {
    const local_redirect_override =
        localStorage.getItem('config.oidc_redirect_uri') || localStorage.getItem('config.redirect_uri');
    if (local_redirect_override) return local_redirect_override;

    // Deriv validates redirect_uri strictly. If the app is accessed via a preview URL
    // (e.g. `*.vercel.app` deployment), force the canonical redirect back to the
    // registered domain to avoid redirect_uri mismatch errors.
    const host = window.location.hostname;
    if (host.endsWith('.vercel.app') && host !== 'kingpinfx.vercel.app') {
        return 'https://kingpinfx.vercel.app';
    }

    // Deriv treats redirect_uri as a strict, exact match; avoid an auto-added trailing slash.
    return window.location.origin;
};

export const getSocketURL = () => {
    const local_storage_server_url = window.localStorage.getItem('config.server_url');
    if (local_storage_server_url) return local_storage_server_url;

    const server_url = getDefaultServerURL();

    return server_url;
};

export const checkAndSetEndpointFromUrl = () => {
    if (isTestLink()) {
        const url_params = new URLSearchParams(location.search.slice(1));

        if (url_params.has('qa_server') && url_params.has('app_id')) {
            const qa_server = url_params.get('qa_server') || '';
            const app_id = url_params.get('app_id') || '';

            url_params.delete('qa_server');
            url_params.delete('app_id');

            if (
                /^(^(www\.)?qa[0-9]{1,4}\.deriv.dev|(.*)\.derivws\.com)$/.test(qa_server) &&
                /^[a-zA-Z0-9]+$/.test(app_id)
            ) {
                localStorage.setItem('config.app_id', app_id);
                localStorage.setItem('config.server_url', qa_server.replace(/"/g, ''));
            }

            const params = url_params.toString();
            const hash = location.hash;

            location.href = `${location.protocol}//${location.hostname}${location.pathname}${
                params ? `?${params}` : ''
            }${hash || ''}`;

            return true;
        }
    }

    return false;
};

export const getDebugServiceWorker = () => {
    const debug_service_worker_flag = window.localStorage.getItem('debug_service_worker');
    if (debug_service_worker_flag) return !!parseInt(debug_service_worker_flag);

    return false;
};

export const generateOAuthURL = () => {
    const { getOauthURL } = URLUtils;
    const oauth_url = getOauthURL();
    const original_url = new URL(oauth_url);
    const hostname = window.location.hostname;

    const deriv_oauth_suffixes = ['deriv.com', 'deriv.me', 'deriv.be', 'deriv.dev'];

    const toHostname = (value: string) => {
        try {
            return new URL(value.includes('://') ? value : `https://${value}`).hostname;
        } catch {
            return value;
        }
    };

    const isAllowedOAuthHostname = (value: string) => {
        const candidate = toHostname(value);
        return candidate.startsWith('oauth.') && deriv_oauth_suffixes.some(suffix => candidate.endsWith(suffix));
    };

    // First priority: Check for configured OAuth host (QA/testing environments)
    const configured_server_url = (LocalStorageUtils.getValue(LocalStorageConstants.configServerURL) ||
        localStorage.getItem('config.server_url')) as string;

    if (configured_server_url && isAllowedOAuthHostname(configured_server_url)) {
        original_url.hostname = toHostname(configured_server_url);
    } else if (original_url.hostname.includes('oauth.deriv.')) {
        // Second priority: Domain-based OAuth URL setting for .me and .be domains
        if (hostname.includes('.deriv.me')) {
            original_url.hostname = 'oauth.deriv.me';
        } else if (hostname.includes('.deriv.be')) {
            original_url.hostname = 'oauth.deriv.be';
        } else {
            // Fallback to original logic for other domains
            const current_domain = getCurrentProductionDomain();
            if (current_domain && deriv_oauth_suffixes.some(suffix => current_domain.endsWith(suffix))) {
                const domain_suffix = current_domain.replace(/^[^.]+\./, '');
                original_url.hostname = `oauth.${domain_suffix}`;
            }
        }
    }

    // Ensure we always use this app's chosen app_id (Deriv OAuth validates it strictly).
    ensureOidcClientId();
    original_url.searchParams.set('app_id', String(getOAuthAppId()));
    return original_url.toString() || oauth_url;
};
