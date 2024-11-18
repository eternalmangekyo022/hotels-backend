import { getHotels } from "../models/hotels.model";

export default {
  getHotels: async (req: any, res: any) => {
    const hotels = await getHotels();
    res.json(hotels);
  },
};
