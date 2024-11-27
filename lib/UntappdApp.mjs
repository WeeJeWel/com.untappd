import Homey from 'homey';
import UntappdAPI from './UntappdAPI.mjs';

export default class UntappdApp extends Homey.App {

  api = new UntappdAPI({
    client_id: Homey.env.CLIENT_ID,
    client_secret: Homey.env.CLIENT_SECRET,
  })

}