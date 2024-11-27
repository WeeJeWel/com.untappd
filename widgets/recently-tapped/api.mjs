export default {

  async getUserBeers({ homey, query }) {
    const { username } = query;
    return homey.app.api.getUserBeers({ username });
  },

  async getBeer({ homey, query }) {
    const { beerId } = query;
    return homey.app.api.getBeer({ beerId });
  },

};
