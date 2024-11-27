import PQueue from 'p-queue';

export default class UntappdAPI {

  __token = null;
  __queue = new PQueue({ concurrency: 1 });
  __cache = {
    beers: {},
  };

  constructor({
    client_id = 'A1D6B821A2969E54B35140CCBAAD1965ACFF529F',
    client_secret = '5FB9AA6D8E40D1FB8E93CCF4CB6D38F6F1254670',
    username = null,
    password = null
  }) {
    if (!client_id) {
      throw new Error('Missing Client ID');
    }
    this.client_id = client_id;

    if (!client_secret) {
      throw new Error('Missing Client Secret');
    }
    this.client_secret = client_secret;

    this.username = username;
    this.password = password;
  }

  async login() {
    if (!this.username) {
      throw new Error('Missing Username');
    }

    if (!this.password) {
      throw new Error('Missing Password');
    }

    const url = new URL('https://api.untappd.com/v4/xauth');
    url.searchParams.set('client_id', this.client_id);
    url.searchParams.set('client_secret', this.client_secret);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `user_name=${this.username}&user_password=${this.password}`,
    });

    if (!res.ok) {
      throw new Error(`Error Signing In: ${err.statusText}`);
    }

    const json = await res.json();
    this.__token = json.response.access_token;
  }

  async getUserBeers({
    username = this.username,
  }) {
    if (!username) {
      throw new Error('Missing Username');
    }

    const url = new URL(`https://api.untappd.com/v4/user/beers/${username}`);
    url.searchParams.set('client_id', this.client_id);
    url.searchParams.set('client_secret', this.client_secret);

    const res = await fetch(url, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    const json = await res.json();
    return json.response;
  }

  async getBeer({
    beerId,
  }) {
    if (this.__cache.beers[beerId]) {
      return this.__cache.beers[beerId];
    }

    return this.__queue.add(async () => {
      const url = new URL(`https://api.untappd.com/v4/beer/info/${beerId}`);
      url.searchParams.set('client_id', this.client_id);
      url.searchParams.set('client_secret', this.client_secret);

      const res = await fetch(url, {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      // Prevent rate limits
      await new Promise(resolve => setTimeout(resolve, 2500));

      const json = await res.json();
      return json.response;
    }).then(result => {
      this.__cache.beers[beerId] = result;
      return result;
    });
  }

}