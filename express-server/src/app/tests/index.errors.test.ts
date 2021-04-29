/* eslint-disable @typescript-eslint/camelcase */
import ClientOauth2 from 'client-oauth2';
import request from 'supertest';
import app from '../index';

const oauthCallbackUri = '/oauth/callback/OpenSRP/?code=Boi4Wz&state=opensrp';

const panic = (err: Error, done: jest.DoneCallback): void => {
    if (err) {
        done(err);
    }
};

jest.mock('client-oauth2', () => {
    class CodeFlow {
        private client: ClientOauth2;
        public constructor(client: ClientOauth2) {
            this.client = client;
        }

        public async getToken() {
            throw new Error('Token not found');
        }
    }

    // tslint:disable-next-line: max-classes-per-file
    return class ClientOAuth2 {
        public code = (() => {
            return new CodeFlow(this as any);
        })();
        public options: ClientOauth2.Options;
        public request: ClientOauth2.Request;
        public constructor(options: ClientOauth2.Options, req: ClientOauth2.Request) {
            this.options = options;
            this.request = req;
        }
    };
});

describe('src/index.ts', () => {
    const actualJsonParse = JSON.parse;

    afterEach(() => {
        JSON.parse = actualJsonParse;
        jest.resetAllMocks();
    });

    it('E2E: oauth/opensrp/callback handles error correctly', async (done) => {
        const spyOnError = jest.spyOn(global, 'Error');

        request(app)
            .get(oauthCallbackUri)
            .end((err: Error, res: request.Response) => {
                panic(err, done);
                expect(spyOnError.mock.calls).toEqual([
                  ["Token not found"],
                  ["cannot GET /oauth/callback/OpenSRP/?code=Boi4Wz&state=opensrp (500)"],
                  ["Internal Server Error"]
                ]);
                expect(res.notFound).toBeFalsy();
                expect(res.serverError).toBeTruthy();
                done();
            });
    });
});
