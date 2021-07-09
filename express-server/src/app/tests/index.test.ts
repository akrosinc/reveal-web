/* eslint-disable @typescript-eslint/camelcase */
import fetch from 'node-fetch';
import MockDate from 'mockdate';
import ClientOauth2 from 'client-oauth2';
import nock from 'nock';
import request from 'supertest';
import {
    EXPRESS_FRONTEND_OPENSRP_CALLBACK_URL,
    EXPRESS_SESSION_LOGIN_URL,
    EXPRESS_KEYCLOAK_LOGOUT_URL,
    EXPRESS_SERVER_LOGOUT_URL,
    EXPRESS_OPENSRP_LOGOUT_URL,
    EXPRESS_FRONTEND_LOGIN_URL
} from '../../configs/envs';
import app from '../index';
import { oauthState, parsedApiResponse, unauthorized } from './fixtures';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { extractCookies } = require('./utils');

const authorizationUri = 'https://opensrp-ops.akros.online/opensrp/oauth/';
const oauthCallbackUri = '/oauth/callback/OpenSRP/?code=Boi4Wz&state=opensrp';

const panic = (err: Error, done: jest.DoneCallback): void => {
    if (err) {
        done(err);
    }
};

jest.mock('../../configs/envs');
jest.mock('node-fetch');

jest.mock('client-oauth2', () => {
    class CodeFlow {
        private client: ClientOauth2;
        public constructor(client: ClientOauth2) {
            this.client = client;
        }

        public getUri() {
            return authorizationUri;
        }

        public async getToken() {
            return this.client.token;
        }
    }
    // tslint:disable-next-line: max-classes-per-file
    class TokenFlow {
        public data = (() => {
            return {
                access_token: '64dc9918-fa1c-435d-9a97-ddb4aa1a8316',
                expires_in: 3221,
                refresh_expires_in: 2592000,
                refresh_token: '808f060c-be93-459e-bd56-3074d9b96229',
                scope: 'read write',
                token_type: 'bearer',
            };
        })();

        public client: ClientOauth2;
        public constructor(client: ClientOauth2) {
            this.client = client;
        }

        public sign(_: any) {
            return { url: 'http://someUrl.com' };
        }
        public async refresh() {
            return {data: this.data};
        }
    }

    // tslint:disable-next-line: max-classes-per-file
    return class ClientOAuth2 {
        public code = (() => {
            return new CodeFlow(this as any);
        })();
        public token = (() => {
            return new TokenFlow(this as any);
        })();
        public options: ClientOauth2.Options;
        public request: ClientOauth2.Request;
        public constructor(options: ClientOauth2.Options, req: ClientOauth2.Request) {
            this.options = options;
            this.request = req;
        }
        public createToken = (() => {
            return this.token
        });
    };
});

describe('src/index.ts', () => {
    const actualJsonParse = JSON.parse;
    let sessionString: string;
    let cookie: { [key: string]: any };

    afterEach(() => {
        JSON.parse = actualJsonParse;
        jest.resetAllMocks();
    });

    it('serves the build.index.html file', (done) => {
        request(app)
            .get('/')
            .expect(200)
            .expect('Do you mind')
            .end((err: Error) => {
                if (err) {
                    throw err;
                }
                done();
            });
    });

    it('oauth/opensrp redirects to auth-server', (done) => {
        request(app)
            .get('/oauth/opensrp')
            .expect(302)
            .end((err: Error, res) => {
                panic(err, done);
                expect(res.header.location).toEqual(authorizationUri);
                expect(res.notFound).toBeFalsy();
                expect(res.redirect).toBeTruthy();
                done();
            });
    });

    it('E2E: oauth/opensrp/callback works correctly', async (done) => {
        MockDate.set('1/1/2020');
        JSON.parse = (body) => {
            if (body === '{}') {
                return parsedApiResponse;
            }
        };
        nock('https://opensrp-ops.akros.online').get(`/opensrp/user-details`).reply(200, {});

        request(app)
            .get(oauthCallbackUri)
            .end((err, res: request.Response) => {
                panic(err, done);
                expect(res.header.location).toEqual(EXPRESS_FRONTEND_OPENSRP_CALLBACK_URL);
                expect(res.notFound).toBeFalsy();
                expect(res.redirect).toBeTruthy();
                sessionString = res.header['set-cookie'][0].split(';')[0];
                cookie = extractCookies(res.header);
                // expect that cookie will expire in: now(a date mocked to be in the future) + token.expires_in
                expect(cookie['reveal-session'].flags).toEqual({
                    Expires: 'Fri, 31 Jan 2020 00:00:00 GMT',
                    HttpOnly: true,
                    Path: '/',
                });
                done();
            });
    });

    it('/oauth/state works correctly without cookie', (done) => {
        request(app)
            .get('/oauth/state')
            .end((err, res) => {
                panic(err, done);
                expect(res.body).toEqual(unauthorized);
                done();
            });
    });

    it('/oauth/state works correctly with cookie', (done) => {
        MockDate.set('1/1/2020');
        request(app)
            .get('/oauth/state')
            .set('cookie', sessionString)
            // .send()
            .end((err: Error, res: request.Response) => {
                panic(err, done);
                expect(res.body).toEqual(oauthState);
                done();
            });
    });

    it('/refresh/token works correctly', (done) => {
        MockDate.set('1/1/2020');
        // when no session is found
        request(app)
            .get('/refresh/token')
            .end((err: Error, res: request.Response) => {
                panic(err, done);
                expect(res.status).toEqual(500);
                expect(res.body).toEqual({message: 'Access token or Refresh token not found'});
                done();
            });

        // call refresh token
        request(app)
        .get('/refresh/token')
        .set('cookie', sessionString)
        .end((err: Error, res: request.Response) => {
            panic(err, done);
            expect(res.body).toEqual(oauthState);
            done();
        });
    });

    it('/refresh/token works correctly when session life time is exceeded', (done) => {
        MockDate.set('1/2/2020');
        request(app)
        .get('/refresh/token')
        .set('cookie', sessionString)
        .end((err: Error, res: request.Response) => {
            panic(err, done);
            expect(res.status).toEqual(500);
            expect(res.body).toEqual({
                message: 'Session is Expired'
            });
            done();
        });
    });

    it('/refresh/token does not change session expiry date', (done) => {
        // change date
        MockDate.set('1/1/2019');
        request(app)
        .get('/refresh/token')
        .set('cookie', sessionString)
        .end((err: Error, res: request.Response) => {
            panic(err, done);
            expect(res.body.session_expires_at).toEqual(oauthState.session_expires_at);
            done();
        });
    });

    it('Accessing login url when next path is undefined and logged in', (done) => {
        // when logged in and nextPath is not provided, redirect to home
        request(app)
            .get('/login')
            .set('cookie', sessionString)
            .expect(302)
            .end((err: Error, res) => {
                panic(err, done);
                expect(res.header.location).toEqual('/');
                expect(res.redirect).toBeTruthy();
                done();
            });
    });
        it('Accessing login url when next Path is defined and logged in', (done) => {
        // when logged in and nextPath is not provided, redirect to home
        request(app)
            .get('/login?next=%2Fteams')
            .set('cookie', sessionString)
            .expect(302)
            .end((err: Error, res) => {
                panic(err, done);
                expect(res.header.location).toEqual('/teams');
                expect(res.redirect).toBeTruthy();
                done();
            });
    });

    it('logs user out from opensrp and calls keycloak', (done) => {
        (fetch as any).mockImplementation(()=> Promise.resolve('successfull'));
        request(app)
            .get('/logout?serverLogout=true')
            .set('Cookie', sessionString)
            .end((err, res: request.Response) => {
                panic(err, done);
                expect(res.header.location).toEqual(`${EXPRESS_KEYCLOAK_LOGOUT_URL}?redirect_uri=${EXPRESS_SERVER_LOGOUT_URL}`);
                expect(res.redirect).toBeTruthy();
                expect(fetch).toHaveBeenCalledTimes(1);
                expect(fetch).toHaveBeenCalledWith(
                    EXPRESS_OPENSRP_LOGOUT_URL,
                    {
                        "headers": {
                            "accept": "application/json",
                            "authorization": "Bearer 64dc9918-fa1c-435d-9a97-ddb4aa1a8316",
                            "contentType": "application/json;charset=UTF-8"
                        },
                        "method": "GET"
                    })
                done();
            });
    });

    it('oauth/opensrp/callback works correctly if response is not stringfied JSON', async (done) => {
        MockDate.set('1/1/2020');
        JSON.parse = (body) => {
            if (body === '{}') {
                return 'string';
            }
        };
        nock('https://opensrp-ops.akros.online').get(`/opensrp/user-details`).reply(200, {});

        request(app)
            .get(oauthCallbackUri)
            .end((err, res: request.Response) => {
                panic(err, done);
                expect(res.header.location).toEqual('/logout?serverLogout=true');
                expect(res.notFound).toBeFalsy();
                expect(res.redirect).toBeTruthy();
                done();
            });
    });

    it('logs user out with cookie', (done) => {
        request(app)
            .get('/logout')
            .set('Cookie', sessionString)
            .end((err, res: request.Response) => {
                panic(err, done);
                expect(res.header.location).toEqual(EXPRESS_SESSION_LOGIN_URL);
                expect(res.redirect).toBeTruthy();
                // check that session is revoked
                request(app)
                    .get('/oauth/state')
                    .end((e: Error, r: request.Response) => {
                        panic(e, done);
                        expect(r.body).toEqual(unauthorized);
                        done();
                    });
            });
    });

    it('Accessing login url when you are logged out', (done) => {
        // this returns express frontend login url when logged out
        request(app)
            .get('/login')
            .expect(302)
            .end((err: Error, res) => {
                panic(err, done);
                expect(res.header.location).toEqual(EXPRESS_FRONTEND_LOGIN_URL);
                expect(res.redirect).toBeTruthy();
                done();
            });
    });

    it('/refresh/token works correctly when refresh is not allowed', (done) => {
        MockDate.set('1/1/2020');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const envModule = require('../../configs/envs');
        envModule.EXPRESS_ALLOW_TOKEN_RENEWAL = false;
        // call refresh token
        request(app)
        .get('/refresh/token')
        .end((err: Error, res: request.Response) => {
            panic(err, done);
            expect(res.status).toEqual(500);
            expect(res.body).toEqual({
                message: 'Session is Expired'
            });
            done();
        });
    });
});
