/* eslint-disable @typescript-eslint/camelcase */
export const parsedApiResponse = {
    preferredName: 'Superset User',
    roles: ['Provider'],
    username: 'superset-user',
};

export const oauthState = {
    gatekeeper: {
        result: {
            oAuth2Data: {
                access_token: '64dc9918-fa1c-435d-9a97-ddb4aa1a8316',
                expires_in: 3221,
                refresh_token: '808f060c-be93-459e-bd56-3074d9b96229',
                refresh_expires_in: 2592000,
                refresh_expires_at: '2020-01-31T00:00:00.000Z',
                scope: 'read write',
                token_expires_at: '2020-01-01T00:53:41.000Z',
                token_type: 'bearer',
            },
            preferredName: 'Superset User',
            roles: ['Provider'],
            username: 'superset-user',
        },
        success: true,
    },
    session: {
        authenticated: true,
        extraData: {
            oAuth2Data: {
                access_token: '64dc9918-fa1c-435d-9a97-ddb4aa1a8316',
                expires_in: 3221,
                refresh_token: '808f060c-be93-459e-bd56-3074d9b96229',
                refresh_expires_in: 2592000,
                refresh_expires_at: '2020-01-31T00:00:00.000Z',
                scope: 'read write',
                token_expires_at: '2020-01-01T00:53:41.000Z',
                token_type: 'bearer',
            },
            preferredName: 'Superset User',
            roles: ['Provider'],
            username: 'superset-user',
        },
        user: {
            email: '',
            gravatar: '',
            name: '',
            username: 'superset-user',
        },
    },
    session_expires_at: '2020-01-01T01:00:00.000Z',
};

export const unauthorized = {
    error: 'Not authorized',
};
